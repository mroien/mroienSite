/**
 * Created by mroien on 2/8/16.
 */
module.exports = {

    port : 4723,
    host : 'localhost',


    getConfig : function() {

        if (process.env.PLATFORM == 'mobile') {
            var mobileConfig = {
                host: this.host,
                port: this.port,
                desiredCapabilities: {
                    appiumVersion: process.env.APPIUM_VERSION,
                    deviceName: process.env.DEVICE_NAME,
                    udid: process.env.UDID,
                    platformVersion: process.env.PLATFORM_VERSION,
                    platformName: process.env.PLATFORM_NAME,
                    browserName: process.env.BROWSER,
                    app: process.env.TEST_APP
                }
            };
            return mobileConfig;

        } else {
            var desktopConfig = {
                desiredCapabilities: {
                    browserName: process.env.BROWSER
                }
            };
            return desktopConfig;
        }
    }
};
