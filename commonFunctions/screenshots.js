/**
 * Created by mroien on 2/8/16.
 */
var webdriverio = require('webdriverio'),
    should = require('should');

module.exports = {

    generateScreenshotName : function(test_name, test_step) {
        var d = new Date(),
            n = d.getTime().toString(),
        //remove special characters from filename
            clean_title = test_step.replace(/[<>:"\/\\|?*]+/g,'');

        //limit to 200 character test_step name
        if (clean_title.length > 200) {
            clean_title = clean_title.slice(0,200);
        }

        return './tests-results/screenshots/' + test_name + '_' +
            clean_title + '_' + n + '.png';
    }

};
