/**
 * Created by Maya on 7.5.15.
 */

'use strict';

angular.module('registryApp.common')
    .directive('contentLoading', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                load: '='
            },
            template: '<div class="content-loading" ng-class="{\'show\': load}"></div>'
        }
    }]);