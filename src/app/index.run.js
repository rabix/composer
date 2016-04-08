function runBlock($log, ConfigProvider, CottonTailConfig, Api) {
    'ngInject';
    $log.debug('runBlock end');

    ConfigProvider.config.query({}, function (result) {
        CottonTailConfig.setConfig(result);
        Api.setupApi();
    }, function (err) {
        new Error(err);
    });

    window.onerror = function (message, file, lineNumber, column, trace) {
        Api.report.send({
            message: message,
            file: file,
            line: lineNumber,
            column: column,
            stack: trace.stack
        });
    };
}

export default runBlock;
