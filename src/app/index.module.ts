/// <reference path="../../.tmp/typings/tsd.d.ts" />


/// <reference path="index.route.ts" />

/// <reference path="index.config.ts" />
/// <reference path="index.run.ts" />
/// <reference path="main/main.controller.ts" />
/// <reference path="../app/components/navbar/navbar.directive.ts" />
/// <reference path="../app/components/malarkey/malarkey.directive.ts" />
/// <reference path="../app/components/webDevTec/webDevTec.service.ts" />
/// <reference path="../app/components/githubContributor/githubContributor.service.ts" />

declare var malarkey: any;
declare var toastr: Toastr;
declare var moment: moment.MomentStatic;

module client {
    'use strict';

    angular.module('client', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router', 'ui.bootstrap'])
        .constant('malarkey', malarkey)
        .constant('toastr', toastr)
        .constant('moment', moment)
        .config(Config)

        .config(RouterConfig)

        .run(RunBlock)
        .service('githubContributor', GithubContributor)
        .service('webDevTec', WebDevTecService)
        .controller('MainController', MainController)
        .directive('navbar', navbar)
        .directive('acmeMalarkey', acmeMalarkey);
}
