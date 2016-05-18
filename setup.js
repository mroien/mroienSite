#!/usr/bin/env node

var child_process = require('child_process'),
    http = require('http'),
    shell = require('shelljs'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    selenium = require('selenium-standalone');

var currentPlatform = os.platform(),
    retry_max = 15,
    retry_timeout = 5000,
    retry_selenium = 1,
    retry_iwdp = 1,
    platform = process.env.PLATFORM,
    browser = process.env.BROWSER;


/********************************************************/
/**************    PREPARING J-UNIT XML    **************/
/********************************************************/

console.log("Deleting all reports and screenshots from JUNIT_REPORT_PATH...");
var testResultsDir = path.join(process.cwd(), process.env.JUNIT_REPORT_PATH);

if (!fs.existsSync(testResultsDir)){
    fs.mkdirSync(testResultsDir);
}

var files = fs.readdirSync(testResultsDir);
if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
        var filePath = testResultsDir + '/' + files[i];
        if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
    }
    console.log("Files deleted.");
} else {
    console.log("No files to delete.");
}


/********************************************************/
/*************    START REQUIRED SERVERS    *************/
/********************************************************/

if (platform == 'desktop') {
    //set up selenium parameters
    var selenium_server = {
        name: 'selenium',
        startCommand: 'build_scripts/selenium.js',
        host: 'localhost',
        path: '/wd/hub/status',
        port: '4444'
    };

    //start selenium-standalone
    checkServer(selenium_server, serverManager_selenium, 0);

} else if (platform == 'mobile') {
    //set up appium parameters
    var appium_server = {
        name: 'appium',
        startCommand: 'node_modules/appium/bin/appium.js',
        host: 'localhost',
        path: '/wd/hub/status',
        port: '4723'
    };

    //start appium
    checkServer(appium_server, serverManager_selenium, 0);

    //start ios-webkit-debug-proxy [iwdp] server for iOS mweb only
    if (browser == 'safari') {
        //set up iwdp parameters
        var iwdp_server = {
            name: 'iosWebkitDebugProxy',
            startCommand: 'build_scripts/iwdp.js',
            host: 'localhost',
            path: '/json',
            port: '27753'
        };

        //start iwdp
        checkServer(iwdp_server, serverManager_iwdp, 0);
    }
}


/********************************************************/
/*******************    FUNCTIONS    ********************/
/********************************************************/


function checkServer(server, cb, status_check) {
    http.get({
        host: server.host,
        path: server.path,
        port: server.port
    }, function(res) {
        //explicitly treat incoming data as utf8 to
        //avoid issues with multi-byte chars
        res.setEncoding('utf8');

        //incrementally capture the incoming response body
        var body = '';
        res.on('data', function(d) {
            body += d;
        });

        //handle the http response
        res.on('end', function() {
            try {
                var parsed_result = JSON.parse(body);
            } catch (err) {
                console.error('Unable to parse response as JSON', err);
                return cb(server, err);
            }
            //pass the needed data back to the callback
            return cb(server, parsed_result, status_check);
        });

    }).on('error', function(err) {
        //handle errors with the request itself
        return cb(server, err.message, status_check);
    });
}


function startServer (server) {

    console.log('- starting ' + server.name + '...');

    //set up log files
    var out = fs.openSync('./log_' + server.name, 'w'); // 'a' >> append log
    var err = fs.openSync('./log_' + server.name, 'w');

    //spawn required server as child process
    var child = child_process.spawn(
        'node',
        [server.startCommand],
        { detached: true, stdio: [ 'ignore', out, err ] }
    );

    //unreference child from parent process
    child.unref();

    //check status of newly started server
    if (server.name == 'iosWebkitDebugProxy') {
        //wrap checkServer in closure for global use with setTimeout
        statusCheck_iwdp = function(){checkServer(server, serverManager_iwdp, 1);};
        setTimeout(statusCheck_iwdp, retry_timeout);
    } else {
        //wrap checkServer in closure for global use with setTimeout
        statusCheck_selenium = function(){checkServer(server, serverManager_selenium, 1);};
        setTimeout(statusCheck_selenium, retry_timeout);
    }
}


function killServer (server) {
    console.log('- ' + server.name + ' already running- ' +
        'kill current process...');

    //seek and destroy process currently running on required port
    if ((currentPlatform.indexOf('darwin')>-1)||
        (currentPlatform.indexOf('linux')>-1)) {
        //mac: kill server
        shell.exec('kill $(lsof -i tcp:' + server.port +
            ' | grep "LISTEN" | awk \'{print $2}\')');
    } else if (currentPlatform.indexOf('win32')>-1){
        //windows: kill server
        shell.exec('for /f "tokens=5" %p in (\'netstat -a -o -n ^| ' +
            'findstr "LISTENING" ^| ' +
            'findstr ":' + server.port + '"\') do ( taskkill -F -PID %p )');
    }
}


function serverManager_selenium (server, response, status_check) {
    //initial server check
    if (! status_check) {

        console.log(server.name.toUpperCase() + ' SERVER REQUIRED');
        if (response.status === 0) {
            //if selenium/appium, grab the server status
            killServer(server);
            startServer(server);
        } else {
            startServer(server);
        }

        //if status_check is true, verify that requested port is open
    } else {
        if (response.status != 0) {
            //check again in 5 seconds
            if (retry_selenium <= retry_max) {
                console.log('- checking ' + server.name + ' status... [' +
                    retry_selenium + ']');

                setTimeout(statusCheck_selenium, retry_timeout);

                retry_selenium += 1;
            } else {
                //failure - quit process
                console.log('FAILURE: ' + server.name + ' not available after ' +
                    retry_max + ' attempts');
                process.exit(1);
            }
        } else {
            console.log(server.name.toUpperCase() + ' SERVER READY');
        }
    }
};

function serverManager_iwdp (server, response, status_check) {
    //initial server check
    if (! status_check) {

        console.log(server.name.toUpperCase() + ' SERVER REQUIRED');
        //check if there is any response from the device
        if (typeof response == 'object') {
            killServer(server);
            startServer(server);
        } else {
            startServer(server);
        }

        //if status_check is true, verify that requested port is open
    } else {

        if (typeof response != 'object') {
            //check again in 5 seconds
            if (retry_iwdp <= retry_max) {
                console.log('- checking ' + server.name + ' status... [' +
                    retry_iwdp + ']');

                setTimeout(statusCheck_iwdp, retry_timeout);
                retry_iwdp += 1;
            } else {
                //failure - quit process
                console.log('FAILURE: ' + server.name + ' not available after ' +
                    retry_max + ' attempts');
                process.exit(1);
            }
        } else {
            console.log(server.name.toUpperCase() + ' SERVER READY');
            //move SafariLauncher to local appium node module
            moveSafariLauncher();
        }
    }
};

function moveSafariLauncher () {
    console.log("Moving SafariLauncher...");
    var targetDir = path.join(process.cwd(), 'node_modules', 'appium', 'build', 'SafariLauncher');

    if (!fs.existsSync(targetDir)){
        fs.mkdirSync(targetDir);
    }

    var oldPath = path.join(process.cwd(), 'build_scripts', 'SafariLauncher.zip');
    var newPath = path.join(targetDir, 'SafariLauncher.zip');

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            console.log('Unable to move SafariLauncher: ', err);
        }
    });
}
