/**
 * Created by mroien on 2/8/16.
 */

var github = function() {
    this.thirty = 30000;
    this.fifteen = 15000;
    this._url = 'https://mroien.github.io/mroien/';
    this.title = 'Tim Oien\'s Personal Site';
    this.carousel = '#carousel';
    this.imgAlt = '.item.active > img';
    this.schoolCN = '.school';
    this.workLoc = '#school + #work';
    this.schoolID = '#school';
    this.white = '#ffffff';
    this.jobs = '.jobs';
    this.logo = '#logo';
    this.tapURL = 'https://www.tapqa.com/';
    this.resumeLink = '.resume a';
    this.contactLoc = '#work + #footer';
    this.fa = '.socialLinks > a';
    this.href = [ 'mailto:oien.tim@gmail.com?Subject=Email%20From%20Website',
        'https://github.com/mroien',
        'https://www.linkedin.com/in/timothy-oien-20699394' ];
    this.github = '.fa-github';
    this.gitUsername = '.vcard-username';
    this.githubUrl = 'https://github.com/mroien';
};

module.exports = new github();
