/**
 * Author: Milica Kadic
 * Date: 1/14/15
 * Time: 4:41 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('isValidInt', ['Helper', function(Helper) {
        return {
            require: 'ngModel',
            scope: {},
            link: function(scope, element, attrs, ctrl) {
                ctrl.$validators.name = function(modelValue) {

                    return Helper.isValidInt(modelValue);

                };
            }
        };
    }]);