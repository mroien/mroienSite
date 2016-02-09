/**
 * Created by mroien on 2/8/16.
 */
var webdriverio = require('webdriverio'),
    config = require('../config/config'),
    commonFunctions = require('../commonFunctions/screenshots'),
    should = require('should'),
    test_name = 'mroien',
    client;

describe("Test my website on Github", function () {
    this.timeout(30000);

    before(function (done) {
        client = webdriverio.remote(config.getConfig());
        client.init(done);
    });

    after(function (done) {
        client.end(done);
    });

    afterEach(function (done) {
        client.getTabIds().then(function (tabs) {
            if (tabs.length > 1) {
                client.close();
                client.switchTab(tabs[0]);
            }
        });
        if (this.currentTest.state == 'failed') {
            //save screenshot on test failure
            screenshot = commonFunctions.generateScreenshotName(test_name,
                this.currentTest.title);
            client.saveScreenshot(screenshot);
        }
        done();
    });

    it('should check the url', function (done) {
        client
            .url('https://mroien.github.io/mroien/')
            .getTitle().then(function (title) {
                (title).should.be.equal('Tim Oien\'s Personal Site')
            })
            .call(done);
    });

    it('should have carousel', function (done) {
        client

            .call(done);
    })
});


