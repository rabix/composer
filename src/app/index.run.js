function runBlock($log, ConfigProvider, CottonTailConfig, Api) {
    'ngInject';
    $log.debug('runBlock end');

    ConfigProvider.config.query({}, function (result) {
        CottonTailConfig.setConfig(result);
        Api.setupApi();
    }, function (err) {
        new Error(err);
    });
}

export default runBlock;
