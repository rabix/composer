/**
 * Author: Milica Kadic
 * Date: 10/14/14
 * Time: 2:18 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('InputFieldCtrl', ['$scope', '$uibModal', '$templateCache', 'Cliche', 'Const', 'lodash', 'ClicheEvents', '$rootScope', function($scope, $modal, $templateCache, Cliche, Const, _, ClicheEvents, $rootScope) {

        var watchers = [];

        if ($scope.suggestedValues && !$scope.values) {
            // $scope.appName == #appName;  Const.exposedSeparator == $;  $scope.prop.id == #property
            // expected suggestedValue == #appName$property
            var suggested = $scope.suggestedValues[$scope.appName + Const.exposedSeparator + $scope.prop.id.slice(1)];
            if (suggested) {
                $scope.model = $scope.values = suggested;
            }
        }

        $scope.view = {};

        $scope.key = $scope.key || 'name';

        $scope.view.name = Cliche.parseName($scope.prop);
        $scope.view.property = $scope.prop || {};
        $scope.view.property.type = Cliche.getSchema('input', $scope.prop, $scope.type, true);
        $scope.view.type = Cliche.parseType($scope.view.property.type);
        $scope.view.required = Cliche.isRequired($scope.view.property.type);
        $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.property.type);
        $scope.view.fields = Cliche.getFieldsRef($scope.view.property.type);
        $scope.view.itemsType = Cliche.getItemsType($scope.view.items);

        $scope.view.tpl = 'views/cliche/inputs/input-' + $scope.view.type.toLowerCase() + '.html';

        $scope.view.includeInPorts = $scope.view.property['sbg:includeInPorts'] || false;

        var keyName = $scope.appName + Const.exposedSeparator + $scope.view.name;

        var enumObj = Cliche.parseEnum($scope.view.property.type);

        $scope.view.symbols = enumObj.symbols;

        $scope.view.expose = $scope.exposed ? !_.isUndefined($scope.exposed[keyName]) : false;
        if ($scope.view.expose || $scope.view.includeInPorts) {
            $scope.isDisabled = true;
        }

        $scope.view.exposible = !_.isUndefined($scope.exposed);

        $scope.view.ignore = $scope.ignoreFiles === 'true' && ($scope.view.type === 'File' || ($scope.view.items === 'File'));

        // TODO: something is wrong when, cannot just change view.name have to implement other logic
        //if ($scope.view.exposible) {
        //    if ($scope.prop.label && $scope.prop.label !== '') {
        //        $scope.view.name = $scope.prop.label;
        //    }
        //}

        /**
         * Get default input scheme
         *
         * @param {*} value
         * @returns {*}
         */
        var getDefaultScheme = function(value) {

            if (_.isObject(value)) {
                return '';
            } else {
                return value;
            }

        };

        /**
         * Get file input scheme
         *
         * @param {*} value
         * @returns {*}
         */
        var getFileScheme = function(value) {

            var validFileKeys = ['path', 'size', 'secondaryFiles', 'metadata'];

            var intersection = _.intersection(validFileKeys, _.keys(value));

            if (intersection.length > 0) {
                return value;
            } else {
                return {path: value};
            }

        };

        /**
         * Get object input scheme
         *
         * @param {*} value
         * @returns {*}
         */
        var getObjectScheme = function(value) {

            if (_.isObject(value)) {
                return value;
            } else {
                return {};
            }

        };

        /**
         * Creates a list of objects with values for inputs type record
         * @param {Array} fields
         * @returns {Array}
         */
        function createList(fields) {
            var list = [];
            _.forEach(fields, (function(field) {
                var item = {};
                item.name = Cliche.parseName(field);
                item.prop = field;

                if (Cliche.parseType(Cliche.getSchema('input', field, 'tool', false)) === 'File') {
                    item.value = {path: ''};
                    list.push(item);
                } else {
                    item.value = '';
                    list.push(item);
                }
            }));

            return list;
        }

        /**
         * Populates above generated list for records with values from the model
         * @param model
         * @param list
         */
        function populateValues(model, list) {
            _.forEach(model, function(value, key) {
                var listItem = _.find(list, {'name': key});

                if (listItem) {
                    listItem.value = {};
                    listItem.value[key] = value;
                }
            });
        }

        var inputScheme;

        var setModelDefaultValue = function() {

            /* type FILE */
            if ($scope.view.type === 'File') {

                inputScheme = getFileScheme($scope.model);

                /* type RECORD */
            } else if ($scope.view.type === 'record') {

                $scope.view.list = createList($scope.view.fields);
                populateValues($scope.model, $scope.view.list);

                var watcher = $scope.$watch('view.list', function(n, o) {
                    if (n !== o) {

                        var inputObj = {};
                        _.forEach(_.pluck(n, 'value'), function(val) {
                            var keys = _.keys(val);
                            _.forEach(keys, function(inputKey) {
                                inputObj[inputKey] = val[inputKey];
                            })
                        });

                        $scope.model = inputObj;
                    }
                }, true);

                watchers.push(watcher);
                inputScheme = getObjectScheme($scope.model);

                /* type ARRAY */
            } else if ($scope.view.type === 'array') {
                inputScheme = [];

                $scope.view.items = $scope.view.items || 'string';

                switch ($scope.view.itemsType) {
                    case 'record':
                        _.each($scope.model, function(value) {
                            var innerScheme = getObjectScheme(value);
                            delete innerScheme.path;
                            inputScheme.push(innerScheme);
                        });
                        break;
                    case 'File' || 'file':
                        _.each($scope.model, function(value) {
                            inputScheme.push(getFileScheme(value));
                        });
                        break;
                    case 'map':
                        _.each($scope.model, function(value) {
                            inputScheme.push(getObjectScheme(value));
                        });
                        break;
                    case 'enum':
                        _.each($scope.model, function(value) {
                            inputScheme.push(getDefaultScheme(value));
                        });
                        break;
                    default:
                        //Type checking to avoid an array of characters
                        if (_.isArray($scope.model)) {
                            _.each($scope.model, function(value) {
                                inputScheme.push(getDefaultScheme(value));
                            });
                        } else if (_.isString($scope.model)) {
                            inputScheme.push(getDefaultScheme($scope.model));
                        }
                        break;
                }

                /* type MAP */
            } else if ($scope.view.type === 'map') {
                inputScheme = getObjectScheme($scope.model);

                /* type STRING, NUMBER, INTEGER, BOOLEAN */
            } else {
                inputScheme = getDefaultScheme($scope.model);
            }

            $scope.view.model = inputScheme;
        };

        // TODO: Figure this out for complex props, try to avoid this deep watch
        var deepWatcher = $scope.$watch('view.model', function(n, o) {
            if (n !== o) {
                //Executor treats empty arrays as null, so Cliche should to. This will cause scripts
                //relying on [].forEach() or [].sort() to throw an error.
                if (_.isArray(n) && _.isEmpty(n)) {
                    $scope.model = null;
                } else {
                    $scope.model = n;
                }
                $rootScope.$broadcast(ClicheEvents.JOB.CHANGED, {job: n});
            }
        }, true);
        watchers.push(deepWatcher);


//        // TODO: Figure this out for complex props
//        if ($scope.view.type === 'File') {
//            $scope.$watch('view.model.path', function(n, o) {
//                if (n !== o) {
//                    if (typeof $scope.model !== 'undefined'){
//                        $scope.model.path = n;
//                    } else {
//                        $scope.model = $scope.view.model;
//                    }
//                }
//            });
//        }

        /**
         * Open modal to enter more parameters for the input file
         */
        $scope.more = function() {

            var modalInstance = $modal.open({
                template: $templateCache.get('views/cliche/partials/input-file-more.html'),
                controller: 'InputFileMoreCtrl',
                windowClass: 'modal-prop',
                resolve: {
                    data: function() {
                        return {schema: $scope.view.model, key: $scope.view.name};
                    }
                }
            });

            modalInstance.result.then(function(schema) {
                $scope.view.model = angular.copy(schema);
            });

        };

        /**
         * Expose current parameter
         */
        $scope.exposeParams = function() {

            if ($scope.view.expose) {
                $scope.exposed[keyName] = $scope.prop;
                $scope.isDisabled = true;
                $scope.handleExpose({appName: $scope.appName, key: $scope.view.name});
            } else {
                delete $scope.exposed[keyName];

                if (typeof $scope.onUnExpose === 'function') {
                    $scope.onUnExpose({appName: $scope.appName, key: $scope.view.name, value: $scope.view.model});
                    if ($scope.suggestedValues[$scope.appName + Const.exposedSeparator + $scope.prop.id]) {
                        $scope.values = $scope.suggestedValues[$scope.appName + Const.exposedSeparator + $scope.prop.id];
                    }
                }

                $scope.isDisabled = false;
            }

        };

        $scope.includeInPorts = function() {

            if ($scope.view.includeInPorts) {
                $scope.view.expose = false;
                $scope.exposeParams();
            }

            $scope.isDisabled = $scope.view.includeInPorts;
            $scope.handleIncludeInPorts({
                appName: $scope.appName,
                key: $scope.view.name,
                value: $scope.view.includeInPorts
            });
        };

        $scope.$on('$destroy', function() {
            _.forEach(watchers, function(watcher) {
                if (_.isFunction(watcher)) {
                    watcher.call();
                    watcher = null;
                }
            })
        });

        setModelDefaultValue();

    }])
    .directive('inputField', ['RecursionHelper', function(RecursionHelper) {
        return {
            restrict: 'E',
            template: '<ng-form name="inputForm" class="input-property" ng-if="!view.ignore"><ng-include class="include" src="view.tpl"></ng-include></ng-form>',
            scope: {
                model: '=ngModel',
                prop: '=',
                key: '@',
                ignoreFiles: '@',
                form: '=',
                appName: '@',
                exposed: '=?',
                isDisabled: '=?',
                handleExpose: '&',
                onUnExpose: '&',
                handleIncludeInPorts: '&',
                suggestedValues: '=',
                values: '='
            },
            controller: 'InputFieldCtrl',
            compile: function(element) {
                return RecursionHelper.compile(element, function() {
                });
            }
        };
    }]);