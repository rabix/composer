'use strict';

(function() {

    var schemas = {
            array: {
                type: 'array',
                items: 'File'
            },
            File: 'File',
            boolean: 'boolean',
            int: 'int',
            float: 'float',
            enum: {
                type: 'enum',
                symbols: [],
                name: ''
            },
            string: 'string'
        },
        schemaTypes = [
            {
                name: 'Array',
                value: 'array'
            },
            {
                name: 'File',
                value: 'File'
            },
            {
                name: 'boolean',
                value: 'boolean'
            },
            {
                name: 'string',
                value: 'string'
            },
            {
                name: 'int',
                value: 'int'
            },
            {
                name: 'float',
                value: 'float'
            },
            {
                name: 'enum',
                value: 'enum'
            }
        ],
        itemTypes = [
            {
                name: 'File',
                value: 'File'
            },
            {
                name: 'boolean',
                value: 'boolean'
            },
            {
                name: 'string',
                value: 'string'
            },
            {
                name: 'int',
                value: 'int'
            },
            {
                name: 'float',
                value: 'float'
            }
        ];

    function initIONodeModal($scope, data, Common) {

        $scope.view.schemaTypes = schemaTypes;

        $scope.view.itemTypes = itemTypes;

        $scope.schema = _.clone(data.schema, true) || {};

        if (typeof $scope.schema.id !== 'undefined') {
            $scope.schema.id = null;
            delete $scope.schema.id;
        }

        var _parseType = function() {
            var parsed = Common.parseType($scope.schema.type);

            if (typeof parsed === 'object') {
                parsed = parsed.type;
            }

            return parsed;
        };

        var _parseItemType = function() {
            var parsed = Common.parseType($scope.schema.type);

            if (typeof parsed === 'object') {

                if (parsed.type === 'array') {
                    parsed = parsed.items;
                } else {
                    // default item type if its not array so it can be prepopulated
                    parsed = 'File';
                }
            }

            return parsed;

        };

        var _getSymbols = function() {
            var parsed = Common.parseType($scope.schema.type);

            if (typeof parsed === 'object') {

                if (parsed.type === 'enum') {
                    return parsed.symbols;
                }

            }

            return [];
        };

        var _getEnumName = function() {
            var parsed = Common.parseType($scope.schema.type);

            if (typeof parsed === 'object') {

                if (parsed.type === 'enum') {
                    return parsed.name;
                }

            }

            return '';
        };

        var _updateType = function(value) {
            var newType = _.clone(schemas[value], true);

            if (typeof newType === 'object' && newType.type === 'array') {
                newType.items = _.clone(schemas[$scope.view.itemType]);
            }

            if (value === 'enum') {
                newType.name = $scope.view.enumName;
                newType.symbols = $scope.view.enumSymbols;

                console.log('Logging enum type');
                console.log(newType, $scope.view.enumName, $scope.view.enumSymbols);
            }

            if (_.isArray($scope.schema.type)) {
                $scope.schema.type.splice(0, $scope.schema.type.length);

                if ($scope.view.required) {
                    $scope.schema.type.push(newType);
                } else {
                    $scope.schema.type.push('null');
                    $scope.schema.type.push(newType);
                }

            } else {

                if ($scope.view.required) {
                    $scope.schema.type = newType;
                } else {
                    $scope.schema.type.push('null');
                    $scope.schema.type.push(newType);
                }

            }

            if (!$scope.schema['sbg:includeInPorts']) {
                $scope.schema['sbg:includeInPorts'] = true;
            }
        };

        $scope.view.type = _parseType();
        $scope.view.itemType = _parseItemType();
        $scope.view.enumSymbols = _getSymbols();
        $scope.view.enumName = _getEnumName();

        $scope.view.required = (_.isArray($scope.schema.type) && $scope.schema.type.length === 1) || typeof $scope.schema.type === 'string';

        $scope.$watch('view.type', function(n, o) {
            if (n !== o) {
                _updateType(n, o);
            }
        });

        $scope.$watch('view.itemType', function(n, o) {
            if (n !== o) {
                _updateType($scope.view.type);
            }
        });

        $scope.$watch('view.enumName', function(n, o) {
            if (n !== o) {
                _updateType($scope.view.type);
            }
        });

        $scope.$watch('view.enumSymbols', function(n, o) {
            if (n !== o) {
                _updateType($scope.view.type);
            }
        });

        $scope.$watch('view.required', function(n, o) {
            if (n !== o) {
                _updateType($scope.view.type);
            }
        });

        $scope.view.tab = 'schema';
    }

    function initStepInputs($scope, connections, inputs, outputs, Common) {
        $scope.inputConnections = {};

        $scope.sortableOptions = {
//            handle: ' .handle'
            // items: ' .panel:not(.panel-heading)'
            // axis: 'y'
            stop: function(e, ui) {
                // this callback has the changed model
                var inputId = ui.item.data('input');
                console.log($scope.inputConnections[inputId]);
            }
        };

        var inputRefs = $scope.data.inputs;

        inputRefs.sort(function(a, b) {
            if (a.id < b.id) {
                return 1;
            }
            if (b.id < a.id) {
                return -1;
            }
            return 0;
        });

        _.forEach(connections, function(connection) {

            if (typeof $scope.inputConnections[connection.input_name] === 'undefined') {
                $scope.inputConnections[connection.input_name] = [];
            }

            $scope.inputConnections[connection.input_name].push(connection);
        });

        _.forEach($scope.inputConnections, function(connections) {

            connections.sort(function(a, b) {
                if (a.position > b.position) {
                    return 1;
                }
                if (b.position > a.position) {
                    return -1;
                }
                return 0;
            });

        });

        var _filterInputs = function() {
            var inputs = [];

            _.each(inputRefs, function(input) {

                if (Common.checkTypeFile(input.type[1] || input.type[0]) || input['sbg:includeInPorts']) {
                    input.required = input.type.length === 1;
                    inputs.push(input);
                }

            });

            return inputs.length === 0 ? inputs : inputs;
        };

        $scope.view.inputs = _filterInputs();
        // placeholder for input values
        $scope.inputValues = {};

        if (typeof $scope.data.scatter !== 'undefined' && typeof $scope.data.scatter === 'string') {
            $scope.inputValues[$scope.data.scatter] = true;
        }

        $scope.onScatterChange = function(id, value) {
            console.log(id, value);

            if (value) {
                _.forEach($scope.inputValues, function(val, inputId) {
                    if (inputId !== id) {
                        $scope.inputValues[inputId] = false;
                    }
                });
            }
        };
    }

    function initStepIdChangeTab($scope, data) {

        var currentNodeId = data.model.id.slice(1),
            originalNodeId;

        $scope.view.stepId = originalNodeId = currentNodeId;
        $scope.view.isIdOriginal = true;

        /**
         * Check if the current value is different from the one on change.
         * If so set *isIdChanged* flag to true to enable buttons.
         *
         * @param {string} newId
         */
        $scope.onIdChange = function(newId) {
            $scope.view.isIdChanged = ( newId !== currentNodeId );

            $scope.view.isIdOriginal = (newId === originalNodeId);
        };

        /**
         * Remember the changed value of the node ID.
         * Value of *isIdChanged* is reset and buttons disabled.
         * The value can be reversed to original value with reset button.
         *
         * @param {string} newId
         */
        $scope.saveNewId = function(newId) {

            if (newId === currentNodeId) {
                return;
            }

            var id = data.getUniqueId(newId);

            $scope.view.stepId = currentNodeId = id.slice(1);
            $scope.view.isIdChanged = false;
        };

        /**
         * Reset node's ID with original value.
         */
        $scope.resetId = function() {
            $scope.view.stepId = currentNodeId = originalNodeId;

            $scope.onIdChange(currentNodeId);
        };
    }

    angular.module('registryApp.common')
        .controller('ModalTabsCtrl', ['$scope', '$uibModalInstance', 'data', 'common', 'lodash', function($scope, $modalInstance, data, Common, _) {

            $scope.data = data.model;

            $scope.view = {};

            $scope.view.tab = data.tabName || 'info';

            /**
             * Switch tab on the right side
             *
             * @param {string} tab
             */
            $scope.switchTab = function(tab) {
                $scope.view.tab = tab;
            };

            /**
             * Close the modal
             */
            $scope.ok = function() {
                var scatter = false;
                _.forEach($scope.inputValues, function(val, inputId) {
                    if (val) {
                        scatter = inputId;
                    }
                });

                _.forEach($scope.inputConnections, function(connections, inputId) {
                    _.forEach(connections, function(connection, index) {
                        connection.position = index;
                    });
                });

                $modalInstance.close({
                    scatter: scatter,
                    schema: $scope.schema,
                    nodeId: '#' + $scope.view.stepId
                });
            };

            /**
             * Dismiss the modal
             */
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            // Only in case this is I/O node, init it's properties
            if (Common.checkSystem($scope.data)) {
                initIONodeModal($scope, data, Common);
            }
            else {
                // Initialize step's inputs and outputs
                initStepInputs($scope, data.connections, data.inputs, data.outputs, Common);
            }

            // Both IO and step dialogs have tab to change node's ID
            initStepIdChangeTab($scope, data);
        }]);
})();