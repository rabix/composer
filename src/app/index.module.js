/* global moment:false */

import config from './index.config';
import routerConfig from './index.route';
import runBlock from './index.run';

angular.module('cottontail',
    [
        'ngAnimate',
        'ngCookies',
        'ngSanitize',
        'ngResource',
        'ui.router',
        'ui.bootstrap',
        'ui.ace',
        'registryApp.cliche',
        'registryApp.dyole'
    ])
    .constant('moment', moment)
    .config(config)
    .config(routerConfig)
    .run(runBlock);
