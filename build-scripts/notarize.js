const { notarize } = require('electron-notarize');

module.exports = async function (context) {
    if (process.platform !== 'darwin') {
        return;
    }

    console.log('Notarizing...');

    const appId = context.packager.config.appId;
    const appOutDir = context.appOutDir;
    const appName = context.packager.appInfo.productFilename;

    console.log('appId: ', appId);
    console.log('appOutDir: ', appOutDir);
    console.log('appName: ', appName);

    return await notarize({
        appBundleId: appId,
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_ID,
        appleIdPassword: process.env.APPLE_ID_PASSWORD
    });
};
