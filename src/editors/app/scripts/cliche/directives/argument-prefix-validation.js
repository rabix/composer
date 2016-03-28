/**
 * Created by branko7171 on 29.7.15..
 */
angular.module('registryApp.cliche')
    .directive('checkArgumentPrefix', ['$timeout', function($timeout) {
        return {
            scope: {
                other: '=',
                own: '=',
                valName: '@'
            },
            require: '^form',
            link: function(scope, element, attrs, formCtrl) {
                //if(!ngModel) { return; } // do nothing if no ng-model

                // watch own value and re-validate on change
                scope.$watch('own', function() {
                    validate();
                });

                // observe the other value and re-validate on change
                scope.$watch('other', function(val) {
                    validate();
                });

                var validate = function() {
                    $timeout(function() {
                        // values
                        var val1 = scope.own;
                        var val2 = scope.other;
                        var value = true;
                        if (val2 !== '') {
                            value = !_.isUndefined(val1) && !_.isNull(val1) && val1 !== "";
                        }
                        // set validity

                        //formCtrl.$setValidity(value);
                        formCtrl[scope.valName].$setValidity(scope.valName, value);

                    }, 0);

                };

            }
        };
    }]);
