/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyOutputCtrl', ['$scope', '$uibModalInstance', 'Cliche', 'options', 'lodash', function($scope, $modalInstance, Cliche, options, _) {

        var key = options.key || 'name';
        var idObj = {n: '', o: ''};

        $scope.view = {};
        $scope.view.uniqueId = _.uniqueId();
        $scope.view.key = key;
        $scope.view.mode = options.mode;
        /** @type Output */
        $scope.view.property = options.property || {};
        $scope.view.property.type = Cliche.getSchema('output', options.property, options.toolType, false);

        // only add adapter if one has been defined
        if (options.property && options.property.outputBinding) {
            $scope.view.property.outputBinding = Cliche.getAdapter(options.property, false, 'output');
        }

        $scope.view.name = Cliche.parseName(options.property);
        $scope.view.required = Cliche.isRequired($scope.view.property.type);
        $scope.view.type = Cliche.parseType($scope.view.property.type);
        $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.property.type);
        $scope.view.itemsType = Cliche.getItemsType($scope.view.items);

        $scope.view.types = Cliche.getTypes('output');
        $scope.view.itemTypes = Cliche.getTypes('outputItem');

        $scope.view.label = $scope.view.property.label;
        $scope.view.description = $scope.view.property.description;
        $scope.view.fileTypes = $scope.view.property['sbg:fileTypes'];

        $scope.view.fields = Cliche.getFieldsRef($scope.view.property.type);

        var enumObj = Cliche.parseEnum($scope.view.property.type);
        if ($scope.view.items && $scope.view.itemsType === 'enum') {
            enumObj = Cliche.parseEnum($scope.view.items);
        }


        $scope.view.metadata = [];
        if ($scope.view.property.outputBinding && $scope.view.property.outputBinding['sbg:metadata']) {
            _.forOwn($scope.view.property.outputBinding['sbg:metadata'], function(value, key) {
                $scope.view.metadata.push({value: value, key: key});
            });
        }
        $scope.view.isFileType = $scope.view.type === 'File' || $scope.view.itemsType === 'File';

        idObj.o = $scope.view.name;

        // shows expression style input rather than regular input
        // for secondary files
        $scope.view.isSecondaryFilesExpr = false;

        // create list of input ids to inherit metadata from
        $scope.view.inputs = _.pluck(_.filter(Cliche.getTool().inputs, function(input) {
            var type = Cliche.parseType(input.type),
                typeObj = Cliche.parseTypeObj(input.type);
            //@todo: type rec[], rec. recursively check if has file type anywhere either in type, items, or fields
            return type === 'File' || type === 'record' || (typeObj.items && typeObj.items === 'File') || (typeObj.items && typeObj.items.type === 'record');
        }), 'id');

        if (!_.isEmpty($scope.view.inputs)) {
            $scope.$watch('view.property.outputBinding["sbg:inheritMetadataFrom"]', function(n) {
                if (_.isNull(n)) {
                    delete  $scope.view.property.outputBinding['sbg:inheritMetadataFrom'];
                    if (_.isEmpty($scope.view.property.outputBinding)) {
                        delete $scope.view.property.outputBinding;
                    }
                }
            });
        }

        /**
         * Add a blank metadata object to the array
         */
        $scope.addMetadata = function() {
            $scope.view.metadata.push({
                key: '',
                value: ''
            });
        };

        /**
         * Remove meta data from the output
         *
         * @param {integer} index
         */
        $scope.removeMetadata = function(index) {
            $scope.view.metadata.splice(index, 1);
        };

        /**
         * Update existing meta value with expression or literal
         *
         * @param index
         * @param value
         */
        $scope.updateMetaValue = function(index, value) {
            $scope.view.metadata[index].value = value;
        };

        /**
         * Update outputEval value with expression
         *
         * @param {Expression} value
         */
        $scope.updateOutputEval = function(value) {
            if (_.isObject(value)) {
                $scope.view.property.outputBinding.outputEval = value;
            } else {
                delete $scope.view.property.outputBinding.outputEval;
            }

        };

        /**
         * Save property changes
         *
         * @returns {boolean}
         */
        $scope.save = function() {

            $scope.view.error = '';
            $scope.view.form.$setDirty();

            if ($scope.view.form.$invalid) {
                return false;
            }

            if ($scope.view.isFileType) {
                if (!$scope.view.property.outputBinding) {
                    $scope.view.property.outputBinding = {};
                }

                $scope.view.property.outputBinding['sbg:metadata'] = {};


                if (!_.isEmpty($scope.view.metadata)) {
                    _.forEach($scope.view.metadata, function(meta) {
                        if (!meta.error && meta.key !== '') {
                            $scope.view.property.outputBinding['sbg:metadata'][meta.key] = meta.value;
                        }
                    });
                }
            } else {
                if ($scope.view.property.outputBinding && $scope.view.property.outputBinding['sbg:metadata']) {
                    delete $scope.view.property.outputBinding['sbg:metadata'];
                }
            }

            if ($scope.view.type === 'array' && $scope.view.itemsType === 'enum') {
                $scope.view.items.symbols = $scope.view.symbols;
            }


            var inner = {
                key: key,
                name: $scope.view.name,
                required: $scope.view.required,
                recordName: $scope.view.name, // using the same name for input id and recordName
                enumName: $scope.view.name, // and for enumName
                mapName: $scope.view.name, // and for mapName
                type: $scope.view.type,
                items: $scope.view.items,
                symbols: $scope.view.symbols,
                fields: $scope.view.fields,
                values: $scope.view.values,
                label: $scope.view.label,
                description: $scope.view.description
            };

            if ($scope.view.property.schema) {
                $scope.view.property.type = $scope.view.property.schema;
                delete $scope.view.property.schema;
            }

            var formatted = Cliche.formatProperty(inner, $scope.view.property, 'output');

            /**
             * Setting or deleting extra data
             */
            if ($scope.view.label !== '') {
                formatted.label = $scope.view.label;
            } else {
                delete formatted.label;
            }

            if ($scope.view.description !== '') {
                formatted.description = $scope.view.description;
            } else {
                delete formatted.description;
            }

            if ($scope.view.fileTypes !== '') {
                formatted['sbg:fileTypes'] = $scope.view.fileTypes;
            } else {
                delete formatted['sbg:fileTypes'];
            }

            idObj.n = $scope.view.name;

            Cliche.manageProperty(options.mode, formatted, options.properties, idObj)
                .then(function() {
                    $modalInstance.close({prop: formatted});
                }, function(error) {
                    $scope.view.error = error;
                });

        };

        /* watch for the type change in order to adjust the property structure */
        $scope.$watch('view.type', function(n, o) {
            if (n !== o) {
                $scope.view.isFileType = false;

                switch (n) {
                    case 'array':
                        $scope.view.itemsType = 'File';
                        $scope.view.items = $scope.view.itemsType;

                        break;
                    case 'record':
                        $scope.view.fields = [];
                        break;

                    case 'map':
                        $scope.view.values = 'string';
                        break;

                    case 'File':
                        $scope.view.isFileType = true;
                        break;
                    default:

                        delete $scope.view.items;
                        break;
                }
            }
        });

        $scope.$watch('view.itemsType', function(n, o) {
            if (n !== o) {
                $scope.view.symbols = enumObj.symbols;
                $scope.view.isFileType = false;

                switch (n) {
                    case 'record':
                        // if itemsType is a record, create object
                        // items: { type: 'record', fields: []}
                        $scope.view.items = {};
                        $scope.view.items.type = 'record';
                        $scope.view.items.fields = [];
                        $scope.view.items.name = $scope.view.name;
                        break;

                    case 'map':
                        $scope.view.items = {};
                        $scope.view.items.type = 'map';
                        $scope.view.items.values = 'string';
                        $scope.view.items.name = $scope.view.name;
                        break;

                    case 'enum':
                        $scope.view.items = {};
                        $scope.view.items.type = 'enum';
                        $scope.view.items.name = $scope.view.name;
                        break;

                    case 'File':
                        $scope.view.isFileType = true;
                        break;

                    default:
                        // if itemType is not a record, make items string
                        // items: 'string' || 'boolean' || etc.
                        $scope.view.items = $scope.view.itemsType;
                        break;
                }
            }
        });

        /**
         * Update existing glob value with expression or literal
         *
         * @param value
         */
        $scope.updateGlobValue = function(value) {

            if (_.isUndefined($scope.view.property.outputBinding)) {
                $scope.view.property.outputBinding = {};
            }
            $scope.view.property.outputBinding.glob = value;
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

    }]);
