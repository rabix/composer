/**
 * Author: Milica Kadic
 * Date: 1/14/15
 * Time: 4:41 PM
 */
'use strict';

angular.module('registryApp.common')
    .directive('isValidName', ['Helper', function(Helper) {
        return {
            require: 'ngModel',
            scope: {
                whiteSpace: "@isValidName"
            },
            link: function(scope, element, attrs, ctrl) {
                ctrl.$validators.name = function(modelValue, viewValue) {

                    return Helper.isValidName(viewValue, scope.whiteSpace);

                };
            }
        };
    }]);