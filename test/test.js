/**
 * Created by mroien on 2/8/16.
 */
var webdriverio = require('webdriverio'),
    config = require('../config/config'),
    commonFunctions = require('../commonFunctions/screenshots'),
    should = require('should'),
    test_name = 'mroien',
    github = require('../pop/github'),
    client;

describe("Test my website on Github", function () {
    this.timeout(github.thirty);

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
            .url(github._url)
            .getTitle().then(function (title) {
                (title).should.be.equal(github.title)
            })
            .call(done);
    });

    it('should have carousel', function (done) {
        client
            .isExisting(github.carousel).then(function (existing) {
                existing.should.be.true();
            })
            .call(done);
    });

    it('the carousel should rotate', function (done) {
        client
            .getAttribute(github.imgAlt, 'alt').then(function (alt) {
                client.waitUntil(function () {
                    return this.getAttribute(github.imgAlt, 'alt').then(function (newAlt) {
                        return alt !== newAlt;
                    })
                }, 10000)
            })
            .call(done);
    });

    it('should have 2 schools', function (done) {
        client
            .elements(github.schoolCN).then(function (count) {
                (count.value.length).should.be.equal(2)
            })
            .call(done);
    });

    it('should have work experiance after school section', function (done) {
        client
            .isExisting(github.workLoc).then(function (existing) {
                existing.should.be.true();
            })
            .call(done);
    });

    it('should verify the school section has a white background', function (done) {
        client
            .getCssProperty(github.schoolID, 'background-color').then(function (color) {
                (color.parsed.hex).should.be.equal(github.white)
            })
            .call(done);
    });

    it('should verify the work has 3 jobs', function (done) {
        client
            .elements(github.jobs).then(function (count) {
                (count.value.length).should.be.equal(3)
            })
            .call(done);
    });

    it('should click on tap|QA and verify on page', function (done) {
        client
            .click(github.jobs)
            .waitUntil(function () {
                return this.getTabIds().then(function (tabs) {
                    return tabs.length > 1
                });
            }, github.fifteen)
            .getTabIds().then(function (ids) {
            this.switchTab(ids[1])
                .waitForVisible(github.logo, github.fifteen)
                    .getUrl().then(function (url) {
                    url.should.be.eqaul(github.tapURL)
                    })
            })
            .call(done);
    });

    it('should verify resume link exists', function (done) {
        client
            .url(github._url)
            .waitForVisible(github.carousel, github.fifteen)
            .isExisting(github.resumeLink).then(function (existing) {
                existing.should.be.true();
            })
            .call(done);
    });

    it('should verify contact me is at bottom of page', function (done) {
        client
            .isExisting(github.contactLoc).then(function (existing) {
                existing.should.be.true();
            })
            .call(done);
    });

    it('should check all href of footer links', function (done) {
        client
            .getAttribute(github.fa, 'href').then(function (href) {
                (href).should.be.eql(github.href)
            })
            .call(done);
    });

    it('should check github link', function (done) {
        client
            .click(github.github)
            .waitUntil(function () {
                return this.getTabIds().then(function (tabs) {
                    return tabs.length > 1
                });
            }, github.fifteen)
            .getTabIds().then(function (ids) {
                this.switchTab(ids[1])
                    .waitForVisible(github.gitUsername, github.fifteen)
                    .getUrl().then(function (url) {
                    url.should.be.equal(github.githubUrl)
                })
            })
            .call(done);
    });
});


