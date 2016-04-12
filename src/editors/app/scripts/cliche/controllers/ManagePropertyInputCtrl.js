/**
 * Author: Milica Kadic
 * Date: 12/18/14
 * Time: 12:30 PM
 */

'use strict';

angular.module('registryApp.cliche')
    .controller('ManagePropertyInputCtrl', ['$scope', '$uibModalInstance', 'Cliche', 'options', 'lodash', function($scope, $modalInstance, Cliche, options, _) {

        var key = options.key || 'name';
        var idObj = {n: '', o: ''};
        var cacheAdapter = {
            'sbg:cmdInclude': 'true',
            separate: true
        };

        var cachedInputBinding;

        $scope.view = {};
        $scope.view.key = key;
        $scope.view.mode = options.mode;
        $scope.view.property = options.property || {};
        $scope.view.property.type = Cliche.getSchema('input', options.property, options.toolType, false);

        // only add adapter if one has been defined
        if (options.property && options.property.inputBinding) {
            $scope.view.property.inputBinding = Cliche.getAdapter(options.property, false, 'input');
            cachedInputBinding = _.cloneDeep($scope.view.property.inputBinding);
        }

        $scope.view.name = Cliche.parseName(options.property);
        $scope.view.required = Cliche.isRequired($scope.view.property.type);
        $scope.view.type = Cliche.parseType($scope.view.property.type);
        $scope.view.items = Cliche.getItemsRef($scope.view.type, $scope.view.property.type);
        $scope.view.itemsType = Cliche.getItemsType($scope.view.items);

        $scope.view.types = Cliche.getTypes('input');
        $scope.view.itemTypes = Cliche.getTypes('inputItem');

        var enumObj = Cliche.parseEnum($scope.view.property.type);
        if ($scope.view.items && $scope.view.itemsType === 'enum') {
            enumObj = Cliche.parseEnum($scope.view.items);
        }

        $scope.view.symbols = enumObj.symbols;
        $scope.view.fields = Cliche.getFieldsRef($scope.view.property.type);

        $scope.view.disabled = $scope.view.itemsType === 'record' || $scope.view.type === 'record';
        $scope.view.disabledAll = $scope.view.itemsType === 'map' || $scope.view.type === 'map';
        $scope.view.adapter = !!(!_.isUndefined($scope.view.property.inputBinding) && $scope.view.property.inputBinding['sbg:cmdInclude']);

        $scope.view.description = $scope.view.property.description || '';
        $scope.view.label = $scope.view.property.label || '';
        $scope.view.fileTypes = $scope.view.property['sbg:fileTypes'] || '';
        $scope.view.altPrefix = $scope.view.property['sbg:altPrefix'] || '';
        $scope.view.stageInput = $scope.view.property['sbg:stageInput'] || null;
        $scope.view.toolDefaultValue = $scope.view.property['sbg:toolDefaultValue'] || '';

        $scope.isFileType = $scope.view.type === 'File' || $scope.view.itemsType === 'File';
        $scope.isRecordType = $scope.view.type === 'record' || $scope.view.itemsType === 'record';
        $scope.showStageInput = $scope.isFileType || $scope.isRecordType;

        idObj.o = $scope.view.name;

        /**
         * Array of additional information fields
         * @type {*[]}
         */
        var additionalInformation = [
            {
                name: 'description',
                custom: false
            },
            {
                name: 'label',
                custom: false
            },
            {
                name: 'category',
                custom: true
            },
            {
                name: 'altPrefix',
                custom: true
            },
            {
                name: 'toolDefaultValue',
                custom: true
            },
            {
                name: 'fileTypes',
                custom: true
            },
            {
                name: 'stageInput',
                custom: true
            }
        ];

        _.forEach(additionalInformation, function(field) {
            var prefix = field.custom ? 'sbg:' : '';
            $scope.view[field.name] = $scope.view.property[prefix + field.name] || '';
        });


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

            /* special case, if enum type we need to check if enum name already exists */
            if ($scope.view.type === 'enum') {
                enumObj.newName = $scope.view.name;

                if (Cliche.checkIfEnumNameExists(options.mode, enumObj)) {
                    $scope.view.error = 'Choose another enum name, "' + $scope.view.name + '" already exists';
                    return false;
                }
            }

            if ($scope.view.type === 'array' && $scope.view.itemsType === 'enum') {
                $scope.view.items.symbols = $scope.view.symbols;
            }

            var inner = {
                key: key,
                name: $scope.view.name,
                required: $scope.view.required,
                type: $scope.view.type,
                recordName: $scope.view.name, // using the same name for input id and recordName
                enumName: $scope.view.name, // and for enumName
                mapName: $scope.view.name, // and for mapName
                symbols: $scope.view.symbols,
                items: $scope.view.items,
                fields: $scope.view.fields,
                values: $scope.view.values,
                label: $scope.view.label,
                description: $scope.view.description
            };

            var formatted = Cliche.formatProperty(inner, $scope.view.property, 'input');

            /**
             * Save extra fields only if they are populated
             */
            _.forEach(additionalInformation, function(field) {
                var prefix = field.custom ? 'sbg:' : '';

                if ($scope.view[field.name] !== '') {
                    $scope.view[field.name] = $scope.view[field.name] === 'null' ? null : $scope.view[field.name];
                    formatted[prefix + field.name] = $scope.view[field.name];
                } else {
                    delete formatted[prefix + field.name];
                }
            });

            if ($scope.view.type !== 'File' && $scope.view.itemsType !== 'File') {
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
                $scope.isRecordType = false;
                $scope.isFileType = false;

                switch (n) {
                    case 'array':
                        $scope.view.itemsType = 'string';
                        $scope.view.items = $scope.view.itemsType;

                        if ($scope.view.property.inputBinding) {
                            $scope.view.property.inputBinding.itemSeparator = null;
                        }
                        break;
                    case 'record':
                        $scope.isFileType = false;
                        $scope.view.disabled = true;
                        $scope.isRecordType = true;

                        $scope.view.fields = [];

                        break;

                    case 'map':
                        $scope.isFileType = false;

                        $scope.view.disabledAll = true;
                        $scope.view.adapter = false;
                        if ($scope.view.property.inputBinding) {
                            $scope.toggleAdapter();
                        }

                        $scope.view.values = 'string';
                        break;

                    default:
                        $scope.view.disabledAll = $scope.view.disabled = false;
                        $scope.isFileType = n === 'File';

                        delete $scope.view.items;
                        break;
                }

                $scope.showStageInput = $scope.isFileType || $scope.isRecordType;
                $scope.view.stageInput = $scope.showStageInput ? $scope.view.stageInput : null;
            }
        });

        /* watch for the items type change in order to adjust the property structure */
        $scope.$watch('view.itemsType', function(n, o) {
            if (n !== o) {
                $scope.view.symbols = enumObj.symbols;
                $scope.isRecordType = false;
                $scope.isFileType = false;

                switch (n) {
                    case 'record':
                        // if itemsType is a record, create object
                        // items: { type: 'record', fields: []}
                        $scope.view.disabled = true;
                        $scope.view.items = {};
                        $scope.isRecordType = true;

                        if (_.isUndefined($scope.view.items.fields)) {
                            $scope.view.items.type = 'record';
                            $scope.view.items.fields = [];
                            $scope.view.items.name = $scope.view.name;

                            if ($scope.view.adapter) {
                                $scope.view.property.inputBinding.prefix = '';
                                $scope.view.property.inputBinding.separate = true;
                                delete $scope.view.property.inputBinding.itemSeparator;
                                delete $scope.view.property.inputBinding.valueFrom;
                            }
                        }
                        break;

                    case 'map':
                        $scope.view.disabledAll = true;
                        $scope.view.items = {};

                        $scope.view.items.type = 'map';
                        $scope.view.items.values = 'string';
                        $scope.view.items.name = $scope.view.name;

                        $scope.view.adapter = false;
                        if ($scope.view.property.inputBinding) {
                            $scope.toggleAdapter();
                        }
                        break;

                    case 'enum':
                        $scope.view.items = {};
                        $scope.view.items.type = 'enum';
                        $scope.view.items.name = $scope.view.name;

                        break;

                    default:
                        // if itemType is not a record, make items string
                        // items: 'string' || 'boolean' || etc.

                        $scope.view.disabled = $scope.view.disabledAll = false;
                        $scope.view.items = $scope.view.itemsType;

                        $scope.isFileType = n === 'File';
                        break;
                }

                $scope.showStageInput = $scope.isFileType || $scope.isRecordType;
                $scope.view.stageInput = $scope.showStageInput ? $scope.view.stageInput : null;
            }
        });

        /**
         * Update transform value with expression
         *
         * @param value
         */
        $scope.updateTransform = function(value) {

            if (_.isObject(value)) {
                $scope.view.property.inputBinding.valueFrom = value;
            } else {
                delete $scope.view.property.inputBinding.valueFrom;
            }

        };

        /**
         * Toggle adapter definition
         */
        $scope.toggleAdapter = function() {

            if ($scope.view.adapter) {
                $scope.view.property.inputBinding = _.extend($scope.view.property.inputBinding, cacheAdapter) || cacheAdapter;
                if ($scope.view.type === 'array') {
                    $scope.view.property.inputBinding.itemSeparator = null;
                }
            } else {
                cacheAdapter = angular.copy($scope.view.property.inputBinding);
                delete $scope.view.property.inputBinding;

                if (cacheAdapter.secondaryFiles) {
                    $scope.view.property.inputBinding = {
                        secondaryFiles: cacheAdapter.secondaryFiles
                    };
                }
            }
        };

        $scope.addSecondaryFile = function() {
            if (_.isUndefined($scope.view.property.inputBinding)) {
                $scope.view.property.inputBinding = {
                    secondaryFiles: []
                };
            } else if (_.isUndefined($scope.view.property.inputBinding.secondaryFiles)) {
                $scope.view.property.inputBinding.secondaryFiles = [];
            }

            $scope.view.property.inputBinding.secondaryFiles.push('');
        };

        $scope.updateSecondaryFile = function(value, index) {
            $scope.view.property.inputBinding.secondaryFiles[index] = value;
        };

        $scope.removeSecondaryFile = function(index) {
            $scope.view.property.inputBinding.secondaryFiles.splice(index, 1);
            if ($scope.view.property.inputBinding.secondaryFiles.length === 0) {
                delete $scope.view.property.inputBinding.secondaryFiles;
            }

            $scope.view.form.$setDirty();
        };

        /**
         * Dismiss modal
         */
        $scope.cancel = function() {
            if (cachedInputBinding) {
                $scope.view.property.inputBinding = cachedInputBinding;
            }
            $modalInstance.dismiss('cancel');
        };

    }]);
