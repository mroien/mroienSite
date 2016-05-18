// #!/usr/bin/env node
// var shell = require("shelljs");
// var commandLineArgs = require('command-line-args');
// var testConfig = require('./config/test_config');
//
// var cli = commandLineArgs([
//     { name: 'site', type: String, multiple:true },
//     { name: 'feature', type: String },
//     { name: 'tests', type: String, multiple:true},
//     { name: 'mocha', type: Boolean },
//     { name: 'npm', type: Boolean },
//     { name: 'web', type: Boolean },
//     { name: 'build_report', type: Boolean },
//     { name: 'use_site_dir', type: Boolean }
// ]);
//
// var options = cli.parse();
// //TODO: Feature can easily be env parameter
// var feature = options.feature;
// var tests = undefined;
// var site = process.env.SITE;
// var testCase =  process.env.TESTCASE;
//
// if (!process.env.JUNIT_REPORT_PATH) {
//     throw "JUNIT_REPORT_PATH must be set!";
// }
// if (!process.env.TESTENV) {
//     throw "TESTENV must be set!";
// }
// if (!site) {
//     throw "SITE must be set to valid site or 'all'!";
// }
// if (!testCase) {
//     throw "TESTCASE must be set to valid testcase or 'all'!";
// }
// if (!feature) {
//     throw "options.feature must be set in npm script!"
// }
//
// //Site will only passed in when building mocha command.
// //With npm command, it is pulled from environmental variable
// //to accommodate jenkins architecture.
// if (options.site) {
//     process.env.SITE = options.site;
//     site = [options.site];
// } else {
//     site = [process.env.SITE];
// }
//
// // if site is set to 'all', pull all sites from test_config
// // note that this is only applicable to npm command since it does not
// // leverage options.site
// if ((options.npm) &&
//     (site == 'all')) {
//     site = testConfig[feature]['sites'];
// }
//
// //if process.env.TESTCASE is not set and options.tests
// //is passed in, set tests to the optional parameter
// //This allows one to run the mocha npm script by passing
// //parameters instead of having to set environmental params.
// if ((options.tests)&&
//     (testCase == undefined)) {
//     tests = [options.tests];
// }
// //
// else if ((testCase == 'all')&&(options.mocha)) {
//     tests = testConfig[site]['tests'];
// } else {
//     tests = [testCase];
// }
//
// //Recall that options.site will exist when building mocha command
// if (options.mocha) {
//     var mochaCommand = getMochaCommandString(feature, tests, options.site);
//     console.log("Running the following mocha command: " + mochaCommand);
//     shell.exec(mochaCommand);
// }
//
// if (options.npm) {
//     var npmCommand = getNpmCommandString(feature, site);
//     console.log("Running the following npm command: " + npmCommand);
//     shell.exec(npmCommand);
// }
//
// //builds full mocha command
// function getMochaCommandString(feature, tests, site) {
//     var testSuiteName = process.env.TESTENV + "." + site;
//     var commandString = "mocha ";
//
//     //Here we are setting testDir if use_site_dir is passed in for
//     //tests suites that have site subdirectories
//     var siteDir="/";
//     if (options.use_site_dir) {
//         siteDir = "/" + site + "/";
//     }
//
//     for (test in tests) {
//         commandString = commandString + "./tests/" +
//             feature + siteDir + tests[test] + " ";
//     }
//     //Setting parameters for mocha-jenkins-reporter
//     commandString = commandString + " --reporter mocha-jenkins-reporter " +
//         "--reporter-options screenshots=loop,imagestring=" + testSuiteName;
//     return commandString;
// }
//
// //build full npm command
// function getNpmCommandString(feature, sites) {
//     var commandString = '';
//
//     if (options.web) {
//         commandString = commandString +
//             "selenium-standalone install && npm run setup && ";
//     }
//
//     for (site in sites) {
//         commandString = commandString + "npm run " +
//             feature + "_" + sites[site]
//         if (site < sites.length-1) {
//             commandString = commandString + " && "
//         }
//     }
//     commandString = commandString;
//     return commandString;
// }
