/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.common')
    .directive('expr', ['$templateCache', 'lodash', '$rootScope', 'ClicheEvents', function($templateCache, _, $rootScope, ClicheEvents) {

        return {
            restrict: 'E',
            template: $templateCache.get('views/partials/expr.html'),
            require: '?ngModel',
            scope: {
                ngModel: '=',
                ngDisabled: '=?',
                type: '@',
                index: '@',
                placeholder: '@',
                self: '@',
                selfType: '=?',
                selfItemType: '=?',
                onlyExpr: '@',
                tooltipMsg: '@',
                handleItemUpdate: '&',
                handleItemBlur: '&',
                handleNull: '&',
                longLiteral: '@',
                id: '@',
                min: '@',
                propId: '@'
            },
            controller: ['$scope', '$uibModal', 'SandBox', 'Helper', 'rawTransform', function($scope, $modal, SandBox, Helper, rawTransform) {

                $scope.view = {};

                $scope.view.placeholder = $scope.placeholder || 'Enter value';
                $scope.view.type = $scope.type || 'string';

                $scope.view.min = $scope.min || '';
                $scope.view.exprError = '';
                $scope.view.tooltipMsg = $scope.tooltipMsg || '';

                $scope.view.disabled = $scope.ngDisabled;

                $scope.view.longLiteral = $scope.longLiteral === 'true';

                /**
                 * Determine if model is object with defined transformation or literal
                 */
                var determineStructure = function() {

                    if ($scope.ngModel && $scope.ngModel.script) {
                        $scope.view.mode = 'transform';
                        $scope.view.transform = $scope.ngModel;
                        $scope.view.literal = undefined;
                    } else {
                        $scope.view.mode = 'literal';
                        $scope.view.literal = $scope.ngModel;
                        $scope.view.transform = undefined;
                    }

                };

                /* init structure determine */
                determineStructure();

                /**
                 * Check if expression is valid
                 */
                var checkExpression = function() {
                    var tmpDisabledVal = $scope.view.disabled;

                    // JsonPointer is only supported through import, this check ensures that errors don't show up in the UI
                    // and that it cannot be edited
                    if ($scope.ngModel && $scope.ngModel.engine === 'cwl:JsonPointer') {
                        $scope.view.disabled = true;
                        return;
                    }

                    $scope.view.disabled = tmpDisabledVal;

                    if ($scope.view.mode === 'transform') {

                        var self = $scope.self ? {$self: Helper.getTestData($scope.selfType, $scope.selfItemType)} : {};

                        SandBox.evaluate($scope.view.transform.script, self)
                            .then(function(result) {
                                // check if typeof result is the same as $scope.type (parses number strings, etc.)
                                if (!checkFormat(result)) {
                                    $scope.view.exprError = 'Format is invalid, expected type ' + $scope.view.type;
                                } else {
                                    $scope.view.exprError = '';
                                }
                            }, function(error) {
                                $scope.view.exprError = error.name + ':' + error.message;
                            });
                    } else {
                        $scope.view.exprError = '';
                    }

                };

                /**
                 * Checks if the result format conforms to the input format type.
                 *
                 * Defaults to true, because if no $scope.type is provided, type defaults to
                 * string, and all expressions are inherently strings.
                 *
                 * @param {string} expr expression result
                 * @returns {boolean}
                 */
                function checkFormat(expr) {
                    switch ($scope.type) {
                        case 'string':
                            return _.isString(expr) || _.isNumber(expr);
                        case 'number':
                            return _.isNumber(expr);
                        case 'object':
                            return _.isObject(expr) || _.isString(expr) || _.isNumber(expr);
                        default:
                            return true;
                    }
                }

                /* init check of the expression if defined */
                checkExpression();

                $scope.$watch('ngModel', function(n, o) {
                    if (n !== o) {
                        determineStructure();
                        checkExpression();
                    }
                });


                /**
                 * Trigger the update on the outside
                 *
                 * @param {String} n
                 * @param {String} o
                 * @param {String} mode - 'literal' | 'transform'
                 */
                var triggerUpdate = function(n, o, mode) {
                    if (_.isNull(n) || n === '') {
                        $scope.handleNull({index: $scope.index, value: $scope.view[mode]});
                    }

                    if (n !== o && !_.isNull(n) && !_.isUndefined(n)) {

                        checkExpression();

                        if (!_.isUndefined($scope.handleItemUpdate)) {
                            $scope.handleItemUpdate({index: $scope.index, value: $scope.view[mode]});
                            $rootScope.$broadcast(ClicheEvents.EXPRESSION.CHANGED);
                        }
                    }

                };

                $scope.$on(ClicheEvents.JOB.CHANGED, checkExpression);

                $scope.$watch('view.transform.script', function(n, o) {
                    triggerUpdate(n, o, 'transform');
                });

                $scope.$watch('view.literal', function(n, o) {
                    triggerUpdate(n, o, 'literal');
                });

                $scope.$watch('selfType', function(n, o) {
                    if (n !== o) {
                        checkExpression();
                    }
                });

                $scope.$watch('selfItemType', function(n, o) {
                    if (n !== o) {
                        checkExpression();
                    }
                });

                /**
                 * Edit custom expression for input value evaluation
                 */
                $scope.editExpression = function() {

                    var expr = $scope.view.mode === 'transform' ? $scope.view.transform.script : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/edit-expression.html'),
                        controller: 'ExpressionCtrl',
                        windowClass: 'modal-expression',
                        backdrop: 'static',
                        size: 'lg',
                        animation: true,
                        resolve: {
                            options: function() {
                                return {
                                    expr: expr,
                                    self: $scope.self ? true : false,
                                    propId: $scope.propId || ''
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(expr) {

                        if (_.isEmpty(expr)) {

                            $scope.view.mode = 'literal';
                            $scope.view.transform = undefined;
                            $scope.view.literal = '';

                        } else {

                            $scope.view.mode = 'transform';

                            if (!_.isObject($scope.view.transform)) {
                                $scope.view.transform = angular.copy(rawTransform);
                            }
                            $scope.view.transform.script = expr;
                            $scope.view.literal = undefined;
                        }

                        $scope.setDirty();

                    });


                };

                /**
                 * Edit long literals
                 */
                $scope.editLiteral = function() {
                    var expr = $scope.view.mode === 'transform' ? $scope.view.transform.script : '';

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/partials/edit-literal.html'),
                        controller: 'LiteralCtrl',
                        windowClass: 'modal-expression',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            options: function() {
                                return {
                                    literal: $scope.view.literal
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(lit) {
                        $scope.view.mode = 'literal';

                        if (_.isEmpty(lit) && expr) {
                            $scope.view.transform = angular.copy(rawTransform);
                            $scope.view.transform.script = expr;
                            $scope.view.literal = '';

                        } else if (_.isEmpty(lit)) {
                            $scope.view.transform = null;
                            $scope.view.literal = '';

                        } else {
                            $scope.view.literal = lit;
                        }

                        $scope.setDirty();
                    });

                };

            }],
            link: function(scope, element, attr, ngModelCtrl) {
                scope.setDirty = function() {
                    if (ngModelCtrl) {
                        ngModelCtrl.$setDirty();
                    }
                };

                function runHandler(event) {

                    if (event.type === 'keypress' && event.which === 13 || event.type === 'blur' || event.type === 'init' /* for initial load */) {
                        scope.handleItemBlur({index: scope.index, value: scope.view.literal});
                    }
                }

                scope.runHandler = runHandler;

                // only set up event handler if event can be handled
                if (!_.isUndefined(scope.handleItemBlur) && scope.view.mode === 'literal') {

                    // to trigger event for splitting base command when the tool has loaded (import for example)
                    runHandler({type: 'init'});
                }
            }
        };
    }]);