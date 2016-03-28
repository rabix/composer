/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('PropertyInputCtrl', ['$scope', '$uibModal', '$templateCache', 'Cliche', 'Helper', 'SandBox', 'lodash', function($scope, $modal, $templateCache, Cliche, Helper, SandBox, _) {

        $scope.key = $scope.key || 'name';

        $scope.view = {};
        $scope.view.exprError = '';

        /**
         * Parse structure of the property
         * - get property schema
         * - transform type to literal
         * - transform required to boolean
         * - load appropriate template
         */
        var parseStructure = function() {
            var enumObj, tplType;

            $scope.view.property = $scope.prop;
            $scope.view.schema = Cliche.getSchema('input', $scope.prop, $scope.type, true);
            $scope.view.name = Cliche.parseName($scope.prop);
            $scope.view.required = Cliche.isRequired($scope.view.schema);
            $scope.view.type = Cliche.parseType($scope.view.schema);
            $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.schema);
            $scope.view.itemsType = Cliche.getItemsType($scope.view.items);
            $scope.view.fields = Cliche.getFieldsRef($scope.view.schema);
            $scope.view.adapter = Cliche.getAdapter($scope.prop, 'input');

            enumObj = Cliche.parseEnum($scope.view.schema);

            $scope.view.symbols = enumObj.symbols;

            tplType = Cliche.getTplType($scope.view.type);

            $scope.view.tpl = 'views/cliche/property/property-input-tool-' + tplType + '.html';

        };

        /* init parse structure */
        parseStructure();

        if ($scope.view.itemsType === 'record' && _.isUndefined($scope.view.items.fields)) {
            $scope.view.items.fields = [];
        }

        /**
         * Check if expression is valid
         */
        var checkExpression = function() {

            if ($scope.view.property.inputBinding &&
                $scope.view.property.inputBinding.valueFrom &&
                $scope.view.property.inputBinding.valueFrom.value) {

                var itemType = Cliche.getItemsType($scope.view.items);
                var self = {$self: Helper.getTestData($scope.view.type, itemType)};

                SandBox.evaluate($scope.view.property.inputBinding.valueFrom.script, self)
                    .then(function() {
                        $scope.view.exprError = '';
                    }, function(error) {
                        $scope.view.exprError = error.name + ':' + error.message;
                    });
            } else {
                $scope.view.exprError = '';
            }

        };

        /* init check of the expression if defined */
        checkExpression();

        /**
         * Adjust input object depending of the action
         *
         * @param {string} mode - change or delete
         * @param {string} oldName
         * @param {string} newName
         * @returns {boolean}
         */
        var adjustInputs = function(mode, oldName, newName) {

            if (oldName === newName) {
                return false;
            }

            if ($scope.inputs && !_.isUndefined($scope.inputs[oldName])) {
                if (mode === 'change') {
                    $scope.inputs[newName] = angular.copy($scope.inputs[oldName]);
                }
                delete $scope.inputs[oldName];
            }

            if (_.isArray($scope.inputs)) {
                _.each($scope.inputs, function(input) {
                    if (!_.isUndefined(input)) {
                        if (mode === 'change') {
                            input[newName] = angular.copy(input[oldName]);
                        }
                        delete input[oldName];
                    }
                });
            }
        };

        var updateDefaultValue = function(result, oldType) {
            var schema = Cliche.getSchema('input', result.prop, 'tool', false);
            var type = Cliche.parseType(schema);
            var items = Cliche.getItemsRef(type, schema);
            var itemsType = Cliche.getItemsType(items);

            if (oldType !== type) {

                var name = Cliche.parseName(result.prop);
                var enumObj = Cliche.parseEnum(schema);
                if (items && itemsType === 'enum') {
                    enumObj = Cliche.parseEnum(items);
                }

                $scope.inputs[name] = Helper.getDefaultInputValue(name, enumObj.symbols, type, itemsType);
            }
        };

        /**
         * Toggle property box visibility
         */
        $scope.toggle = function() {
            $scope.active = !$scope.active;
        };

        /**
         * Edit property
         */
        $scope.edit = function() {
            $scope.setDirty();

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/manage/tool-input.html'),
                controller: 'ManagePropertyInputCtrl',
                windowClass: 'modal-prop',
                size: 'lg',
                resolve: {
                    options: function() {
                        return {
                            mode: 'edit',
                            key: $scope.key,
                            toolType: $scope.type,
                            property: angular.copy($scope.prop),
                            properties: $scope.properties
                        };
                    }
                }
            });

            modalInstance.result.then(function(result) {

                var oldName = $scope.view.name;
                var oldType = $scope.view.type;

                // checking if they are equal rather than the $dirty/$validity of the form
                // because not all form elements inside the modal will change the form correctly
                if ($scope.prop !== result.prop) {
                    Cliche.copyPropertyParams(result.prop, $scope.prop);

                    parseStructure();
                    checkExpression();

                    adjustInputs('change', oldName, $scope.view.name);
                    updateDefaultValue(result, oldType);

                    $scope.handler();

                    Cliche.generateCommand();
                } else {
                    $scope.setPristine();
                }
            }, function() {
                $scope.setPristine();
            });
        };

        /**
         * Remove particular property
         */
        $scope.remove = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/partials/confirm-delete.html'),
                controller: 'ModalCtrl',
                windowClass: 'modal-confirm',
                resolve: {
                    data: function() {
                        return {};
                    }
                }
            });

            modalInstance.result.then(function() {

                Cliche.deleteProperty($scope.key, $scope.view.name, $scope.properties);

                adjustInputs('delete', $scope.view.name);

                $scope.handler();

                Cliche.generateCommand();
                $scope.setDirty();
            });
        };

        /**
         * Handle actions initiated from the property header
         *
         * @param action
         */
        $scope.handleAction = function(action) {

            if (typeof $scope[action] === 'function') {
                $scope[action]();
            }
        };

        /**
         * Sorts inputs/args by position
         * @param item
         * @returns {*}
         */
        $scope.sortByPosition = function(item) {

            var position = item.inputBinding && item.inputBinding.position ? item.inputBinding.position : 0; //input
            position = item.position ? item.position : position; //args

            return position;
        };

    }])
    .directive('propertyInput', ['$templateCache', 'RecursionHelper', function($templateCache, RecursionHelper) {

        return {
            restrict: 'E',
            template: '<div class="property-box {{ type }}" ng-class="{active: active}"><ng-include class="include" src="view.tpl"></ng-include></div>',
            scope: {
                type: '@',
                key: '@',
                idPrefix: '@',
                index: '=',
                prop: '=ngModel',
                properties: '=',
                inputs: '=',
                handler: '&'
            },
            require: '?ngModel',
            controller: 'PropertyInputCtrl',
            compile: function(element) {
                // RecursionHelper.compile() takes the element and a link function
                return RecursionHelper.compile(element, function(scope, element, attr, ngModelCtrl) {
                    var originalPristineStatus;

                    scope.setDirty = function() {

                        if (ngModelCtrl) {
                            if (typeof originalPristineStatus === 'undefined') {
                                // ngModel parent = inputs, inputs parent = form.tool
                                originalPristineStatus = ngModelCtrl.$$parentForm.$$parentForm.$pristine;
                            }
                            ngModelCtrl.$setDirty();
                        }
                    };

                    scope.setPristine = function() {
                        // will not set form to pristine if it was not so originally
                        if (ngModelCtrl && originalPristineStatus) {
                            // ngModel -> inputs form -> tool form
                            ngModelCtrl.$$parentForm.$$parentForm.$setPristine();
                            ngModelCtrl.$setPristine();
                        }
                    };
                });
            }
        };
    }]);
