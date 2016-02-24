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
    'use strict';

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
        if (this.currentTest.state === 'failed') {
            //save screenshot on test failure
            let screenshot = commonFunctions.generateScreenshotName(test_name,
                this.currentTest.title);
            client.saveScreenshot(screenshot);
        }
        done();
    });

    it('should check the url', (done) => {
        return client
            .url(github._url)
            .getTitle().then((title) => {
                (title).should.be.equal(github.title)
            })
            .call(done);
    });

    it('should have carousel', (done) => {
        return client
            .isExisting(github.carousel).then((existing) => {
                existing.should.be.true();
            })
            .call(done);
    });

    it('the carousel should rotate', (done) => {
        return client
            .getAttribute(github.imgAlt, 'alt').then(function (alt) {
                client.waitUntil(function () {
                    return this.getAttribute(github.imgAlt, 'alt').then(function (newAlt) {
                        return alt !== newAlt;
                    })
                }, 10000)
            })
            .call(done);
    });

    it('should have 2 schools', (done) => {
        return client
            .elements(github.schoolCN).then((count) => {
                (count.value.length).should.be.equal(2)
            })
            .call(done);
    });

    it('should have work experiance after school section', (done) =>{
        return client
            .isExisting(github.workLoc).then((existing) =>{
                existing.should.be.true();
            })
            .call(done);
    });

    it('should verify the school section has a white background', (done) =>{
        return client
            .getCssProperty(github.schoolID, 'background-color').then((color) =>{
                (color.parsed.hex).should.be.equal(github.white)
            })
            .call(done);
    });

    it('should verify the work has 3 jobs', (done) => {
        return client
            .elements(github.jobs).then((count) => {
                (count.value.length).should.be.equal(3)
            })
            .call(done);
    });

    it('should click on tap|QA and verify on page', (done) => {
        return client
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

    it('should verify resume link exists', (done) => {
        return client
            .url(github._url)
            .waitForVisible(github.carousel, github.fifteen)
            .isExisting(github.resumeLink).then((existing) => {
                existing.should.be.true();
            })
            .call(done);
    });

    it('should verify contact me is at bottom of page', (done) => {
        return client
            .isExisting(github.contactLoc).then((existing) => {
                existing.should.be.true();
            })
            .call(done);
    });

    it('should check all href of footer links', (done) => {
        return client
            .getAttribute(github.fa, 'href').then((href) => {
                (href).should.be.eql(github.href)
            })
            .call(done);
    });

    it('should check github link', (done) => {
        return client
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


