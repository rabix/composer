/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:33 PM
 */

/* globals angular */

angular.module('registryApp.cliche')
    .factory('Cliche', ['$q', '$injector', 'rawTool', 'rawJob', 'rawTransform', 'lodash', function($q, $injector, rawTool, rawJob, rawTransform, _) {
        'use strict';

        /**
         * Tool json object
         *
         * @type CWLTool
         */
        var toolJSON = {};

        /**
         * Job json object
         *
         * @type SBGJob
         */
        var jobJSON = {};

        /**
         * Command generated from input and adapter values
         *
         * @type {string}
         */
        var consoleCMD = '';

        /**
         * Command generator callback
         *
         * @type {*|Function}
         */
        var consoleCMDCallback;

        /**
         * Get available types for inputs and outputs
         *
         * @param {string} type Available 'input', 'output', 'inputItem' and 'outputItem'
         * @returns {*}
         */
        var getTypes = function(type) {

            // temporarily removing inputItem and input 'record', because it isn't supported.
            // frontend supports inputItem: 'record'
            var map = {
                input: ['File', 'string', 'enum', 'int', 'float', 'boolean', 'array', 'record', 'map'],
                output: ['File', 'string', 'enum', 'int', 'float', 'boolean', 'array', 'record', 'map'],
                inputItem: ['string', 'int', 'float', 'File', 'record', 'map', 'enum'],
                outputItem: ['string', 'int', 'float', 'File', 'record', 'map', 'enum']
            };

            return map[type] || [];

        };

        /**
         * Transform tool json into appropriate structure
         *
         * Removes unnecessary/disallowed properties based on the tool type.
         *
         * @param {string} type Can be 'script' or 'tool'
         * @param {CWLTool} json
         */
        var transformToolJson = function(type, json) {

            var transformed = angular.copy(json);

            if (type === 'script') {

                transformed['class'] = 'ExpressionTool';
                transformed.transform = getTransformSchema();

                // ex cli adapter stuff;
                delete transformed.baseCommand;
                delete transformed.stdin;
                delete transformed.stdout;
                delete transformed['arguments'];
                // requirements
                // scripts by default should only have the ExpressionEngineRequirement
                transformed.requirements = _.filter(transformed.requirements, {class: 'ExpressionEngineRequirement'});
            } else {

                transformed['class'] = 'CommandLineTool';

                delete transformed.transform;

                if (angular.isUndefined(transformed.baseCommand) ||
                    angular.isUndefined(transformed.stdin) ||
                    angular.isUndefined(transformed.stdout) ||
                    angular.isUndefined(transformed['arguments'])) {

                    transformed.baseCommand = angular.copy(rawTool.baseCommand);
                    transformed.stdin = angular.copy(rawTool.stdin);
                    transformed.stdout = angular.copy(rawTool.stdout);
                    transformed['arguments'] = angular.copy(rawTool['arguments']);
                }
                if (angular.isUndefined(transformed.requirements)) {
                    transformed.requirements = angular.copy(rawTool.requirements);
                }
            }

            return transformed;

        };

        /**
         * Set current tool
         *
         * @param {CWLTool} tool
         */
        var setTool = function(tool) {

            var deferred = $q.defer();

            tool = tool || rawTool;
            toolJSON = angular.copy(tool);

            deferred.resolve();

            return deferred.promise;
        };

        /**
         * Set current job
         *
         * @param {SBGJob} job
         */
        var setJob = function(job) {

            var deferred = $q.defer();

            job = job || rawJob;

            jobJSON = angular.copy(job);

            deferred.resolve();

            return deferred.promise;

        };

        /**
         * Get current tool
         *
         * @returns {CWLTool}
         */
        var getTool = function() {

            return toolJSON;

        };

        /**
         * Get current job
         *
         * @returns {SBGJob}
         */
        var getJob = function() {

            return jobJSON;

        };

        /**
         * Cleanup the local db and prepare fresh cliche vars
         *
         * @param {String} type
         * @param {String} label
         * @returns {Promise}
         */
        var flush = function(type, label) {

            consoleCMD = '';

            var tool = transformToolJson(type, rawTool);
            tool.label = label;

            return $q.all([setTool(tool), setJob(null)]);

        };

        /**
         * Get schema for transformation
         *
         * @returns {Expression}
         */
        var getTransformSchema = function() {

            return angular.copy(rawTransform);

        };

        /**
         * Check if id/name exists
         * - if "id" then both inputs and outputs need to be checked
         * - if "name" then only current level is checked
         *
         * @param {Input|Output} prop
         * @param {Input[]|Output[]} properties
         * @returns {*}
         */
        var checkIfIdExists = function(prop, properties) {

            var exists,
                idName,
                ids,
                compare,
                deferred = $q.defer();

            if (prop.id) {

                ids = [
                    [toolJSON.id],
                    _.pluck(toolJSON.inputs, 'id'),
                    _.pluck(toolJSON.outputs, 'id')
                ];

                ids = _.reduce(ids, function(fl, a) {
                    return fl.concat(a);
                }, []);


                idName = 'id';
                compare = prop.id;
                exists = _.contains(ids, compare);
            } else {
                idName = 'name';
                compare = prop.name;
                exists = _.find(properties, {'name': compare});
            }

            if (exists) {
                deferred.reject('Choose another ' + idName + ', "' + compare + '" already exists');
            } else {
                deferred.resolve();
            }

            return deferred.promise;

        };

        /**
         * Check if enum name already exists in entire tool object
         *
         * @param {string} mode Can be 'edit' or 'add'
         * @param {object} nameObj
         * @returns {*}
         */
        var checkIfEnumNameExists = function(mode, nameObj) {

            /**
             * Recursive method which compares enum names
             *
             * @param {string} name
             * @param {Input[]} inputs
             * @param {boolean} isFirstLevel
             *
             * @private
             * @returns {boolean}
             */
            function _checkInner(name, inputs, isFirstLevel) {

                var exists = false;

                _.each(inputs, function(i) {

                    /** @type Input */
                    var input = isFirstLevel ? i.type : i;

                    var type = parseType(input.type);

                    if (type === 'enum') {
                        var enumObj = parseEnum(input.type);
                        if (enumObj.name === name) {
                            exists = true;
                            return false;
                        }
                    } else if (type === 'array' && input.type.items && input.type.items.type === 'record' || type === 'record') {
                        exists = _checkInner(name, input.type.items.fields, false);
                        if (exists) {
                            return false;
                        }
                    }
                });

                return exists;

            }

            if (mode === 'edit') {

                if (nameObj.name !== nameObj.newName) {
                    return _checkInner(nameObj.newName, toolJSON.inputs, true);
                } else {
                    return false;
                }

            } else if (mode === 'add') {
                return _checkInner(nameObj.newName, toolJSON.inputs, true);
            }

        };

        /**
         * Manage input or output property - add or edit mode
         *
         * @param {string} mode Can be 'edit' or 'add'
         * @param {Input|Output|Argument} prop
         * @param {Input[]|Output[]|Argument[]} properties
         * @param {object} idObj - contains new and old name of the property
         * @returns {Promise}
         */
        var manageProperty = function(mode, prop, properties, idObj) {

            var deferred = $q.defer();

            if (mode === 'edit') {

                if (idObj.n !== idObj.o) {

                    checkIfIdExists(prop, properties)
                        .then(function() {
                            deferred.resolve();
                        }, function(error) {
                            deferred.reject(error);
                        });

                } else {
                    deferred.resolve();
                }

            } else if (mode === 'add') {

                checkIfIdExists(prop, properties)
                    .then(function() {
                        properties.push(prop);
                        deferred.resolve();
                    }, function(error) {
                        deferred.reject(error);
                    });

            } else {
                deferred.reject('Unknown mode "' + mode + '"');
            }

            return deferred.promise;
        };

        /**
         * Manage argument property  - add or edit mode
         *
         * @param {string} mode Can be 'edit' or 'add'
         * @param {Argument} arg
         * @returns {Promise}
         */
        var manageArg = function(mode, arg) {

            var deferred = $q.defer();

            if (mode === 'edit') {
                deferred.resolve();
            } else if (mode === 'add') {
                toolJSON.arguments.push(arg);
                deferred.resolve();
            } else {
                deferred.reject('Unknown mode "' + mode + '"');
            }

            return deferred.promise;

        };

        /**
         * Returns raw expression requirement
         *
         * @returns {Requirement}
         */
        var getExpressionRequirement = function() {
            return _.find(rawTool.requirements, {'class': 'ExpressionEngineRequirement'});
        };

        /**
         * Delete property (input or output) from the object
         *
         * @param {string} key
         * @param {string} index
         * @param {Input[]|Output[]} properties
         */
        var deleteProperty = function(key, index, properties) {

            var cmp = key === 'id' ? '#' + index : index;

            _.remove(properties, function(prop) {
                return prop[key] === cmp;
            });

        };

        /**
         * Delete argument property from cliAdapter
         *
         * @param {Argument} argument
         */
        var deleteArg = function(argument) {
            _.remove(toolJSON['arguments'], argument);
        };

        /**
         * Extract type literal
         *
         * @param {Type} schema
         * @returns {string} type
         */
        var parseType = function(schema) {

            if (_.isString(schema)) {
                return schema;

            } else if (_.isArray(schema)) {
                var tmp = schema[1] || schema[0];
                return _.isObject(tmp) ? tmp.type : tmp;

            } else if (_.isObject(schema)) {
                return schema.type;
            }
        };

        /**
         * Extract type original object
         *
         * @param {Type} type
         * @returns {string|EnumType|RecordType|ArrayType|MapType}
         */
        var parseTypeObj = function(type) {

            return _.isArray(type) ? type[1] || type[0] : type;

        };

        /**
         * Extract enum symbols and name if available
         *
         * @param {Type} enumType
         * @returns {*}
         */
        var parseEnum = function(enumType) {

            var type = parseTypeObj(enumType);

            if (type.type === 'enum') {

                return {name: type.name, symbols: type.symbols || ['']};

            } else {
                return {name: null, symbols: null};
            }

        };

        /**
         * Parse property name
         *
         * @param {Input|Output} property
         * @returns {*}
         */
        var parseName = function(property) {

            if (_.isUndefined(property)) {
                return '';
            }

            if (property.id) {
                return property.id ? property.id.slice(1) : '';
            } else {
                return property.name;
            }

        };

        /**
         * Parse separation for the input value
         *
         * @param {Binding.separate|boolean} separate
         * @returns {string} output
         */
        var parseSeparation = function(separate) {
            return separate ? ' ' : '';
        };

        /**
         * Parse item separator for the input value
         *
         * @param {Binding.itemSeparator|string|null} itemSeparator
         * @returns {string}
         */
        var parseItemSeparator = function(itemSeparator) {

            var output = '';

            if (_.isUndefined(itemSeparator) || itemSeparator === ' ') {
                output = ' ';
            } else {
                output = itemSeparator;
            }

            return output;

        };

        /**
         * Recursive method for parsing object input values
         *
         * @param {Input[]} properties
         * @param {SBGJob.inputs} inputs
         * @returns {string} output
         */
        var parseObjectInput = function(properties, inputs) {

            var command = [];

            return prepareProperties(properties, inputs)
                .then(function(props) {

                    props = _.sortBy(props, 'position');

                    /* generate command */
                    _.each(props, function(prop) {
                        var separation = parseSeparation(prop.separate);

                        if (!_.isNull(prop.val)) {
                            command.push(prop.prefix + separation + prop.val);
                        }
                    });

                    return command.join(' ');

                }, function(error) {
                    return $q.reject(error);
                });

        };

        /**
         * Apply the transformation function (this is just the mock)
         *
         * @param {Expression|string} transform
         * @param {*} value
         * @param {boolean} self
         * @returns {*}
         */
        var applyTransform = function(transform, value, self) {

            var deferred = $q.defer(),
                SandBox = $injector.get('SandBox'),
                expr = (transform && transform.script) ? transform.script : null,
                selfInput = self ? {$self: value} : {};

            if (expr) {

                SandBox.evaluate(expr, selfInput)
                    .then(function(result) {
                        deferred.resolve(result);
                    }, function(error) {
                        deferred.reject(error);
                    });

            } else {
                deferred.resolve(value);
            }

            return deferred.promise;
        };

        /**
         * Parse input value of the array type
         *
         * @param {Input} property
         * @param {object} input From JobJSON
         * @param {string} prefix
         * @param {string} itemSeparator
         * @returns {string}
         */
        var parseArrayInput = function(property, input, prefix, itemSeparator) {

            var promises = [],
                joiner = ' ',
                /** @type Type */
                schema = getSchema('input', property, 'tool', false),
                type = parseType(schema),
                items = getItemsRef(type, schema),
                separator = parseSeparation(property.inputBinding.separate);

            if (items && items.type !== 'record') {
                joiner = _.isNull(itemSeparator) ? (' ' + prefix + separator) : itemSeparator;
            }

            var evaluate = function(val) {

                var deferred = $q.defer();

                if (items && items.type === 'record') {
                    parseObjectInput(items.fields, val)
                        .then(function(result) {
                            deferred.resolve(result);
                        }, function(error) {
                            deferred.reject(error);
                        });
                } else {
                    applyTransform(property.inputBinding.valueFrom, (_.isObject(val) && !_.isArray(val) ? val.path : val), true)
                        .then(function(result) {
                            deferred.resolve(result);
                        }, function(error) {
                            deferred.reject(error);
                        });
                }

                return deferred.promise;

            };

            if (_.isArray(input) || _.isNull(input)) {

                if (_.isUndefined(property.inputBinding.valueFrom)) {
                    _.each(input, function(val) {
                        promises.push(_.isObject(val) ? val.path : val);
                    });
                } else {
                    promises.push(evaluate(input));
                }

            } else if (_.isString(input)) {
                promises.push(input);
            }


            return $q.all(promises)
                .then(function(result) {
                    return result.join(joiner);
                }, function(error) {
                    return $q.reject(error);
                });

        };

        /**
         * Prepare properties for the command line generating
         *
         * @param {Input[]} properties
         * @param {SBGJob.inputs} inputs
         * @returns {Promise} props
         */
        var prepareProperties = function(properties, inputs) {
            var promises = [],
                keys = _.keys(inputs),
                defined = _.filter(properties, function(property) {

                    var key = parseName(property);

                    // To normalize input bindings, because this property is not set during migrations
                    // but it is necessary for Cliche
                    if (property.inputBinding && !_.isEmpty(property.inputBinding)) {
                        property.inputBinding['sbg:cmdInclude'] = true;
                    }

                    return _.contains(keys, key) && property.inputBinding && property.inputBinding['sbg:cmdInclude'];
                });

            /* go through properties */
            _.each(defined, function(definedProp) {
                var /** @type Input */
                    property = definedProp,
                    deferred = $q.defer(),
                    key = parseName(property),
                    schema = getSchema('input', property, 'tool', false),
                    type = parseType(schema),
                    fields = getFieldsRef(schema),
                    prefix = property.inputBinding.prefix || '',
                    itemSeparator = parseItemSeparator(property.inputBinding.itemSeparator),

                    prop = _.extend({
                        key: key,
                        type: type,
                        val: '',
                        position: property.inputBinding.position || 0,
                        prefix: prefix,
                        separate: property.inputBinding.separate || false
                    }, property.inputBinding);

                // check that a value has been set inside the job, if not return
                if (typeof inputs[key] === 'undefined') {
                    return;
                }

                switch (type) {
                    case 'array':
                        /* if input is ARRAY */
                        parseArrayInput(property, inputs[key], prefix, itemSeparator)
                            .then(function(result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function(error) {
                                deferred.reject(error);
                            });
                        break;
                    case ('File' || 'file'):
                        /* if input is FILE */
                        var value = property.inputBinding.valueFrom ? inputs[key] : inputs[key].path;
                        applyTransform(property.inputBinding.valueFrom, value, true)
                            .then(function(result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function(error) {
                                deferred.reject(error);
                            });
                        break;
                    case 'record':
                        /* if input is RECORD  */
                        // @todo why is type RecordType.fields not compatible with type Input[]?
                        parseObjectInput(fields, inputs[key])
                            .then(function(result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function(error) {
                                deferred.reject(error);
                            });
                        break;
                    case 'boolean':
                        /* if input is BOOLEAN */
                        if (property.inputBinding.valueFrom) {
                            //TODO: this is hack, if bool type has expression defined then it works in the same way as (for example) string input type
                            prop.type = 'string';
                            applyTransform(property.inputBinding.valueFrom, inputs[key], true)
                                .then(function(result) {
                                    prop.val = result;
                                    deferred.resolve(prop);
                                }, function(error) {
                                    deferred.reject(error);
                                });
                        } else {
                            prop.val = '';
                            deferred.resolve(prop);
                            if (inputs[key]) {
                                promises.push(deferred.promise);
                            }
                        }
                        break;
                    default:
                        /* if input is anything else (STRING, ENUM, INT, FLOAT) */
                        applyTransform(property.inputBinding.valueFrom, inputs[key], true)
                            .then(function(result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function(error) {
                                deferred.reject(error);
                            });

                        break;
                }

                if (prop.type !== 'boolean') {
                    promises.push(deferred.promise);
                }

            });

            return $q.all(promises);

        };

        /**
         * Generate preview command for app details page
         *
         * @returns {Promise} command
         */
        var generatePreviewCommand = function() {
            var requiredInputs;

            requiredInputs = _.filter(toolJSON.inputs, function(input) {
                var inputSchema = getSchema('input', input, 'tool', false);
                return isRequired(inputSchema);
            });

            return generateCommand(requiredInputs).then(function(previewCommand) {
                return previewCommand;
            });
        };


        /**
         * Generate the command
         *
         * @return {Promise} command
         */
        var generateCommand = function(toolInputs, jobInputs, args) {
            toolInputs = toolInputs || toolJSON.inputs;
            jobInputs = jobInputs || jobJSON.inputs;
            args = args || toolJSON.arguments;

            // in case baseCommand is not yet defined
            if (!toolJSON.baseCommand) {
                toolJSON.baseCommand = [''];
            }

            return prepareProperties(toolInputs, jobInputs)
            /* go through arguments and concat then with inputs */
                .then(function(inputs) {

                    var argsPromises = [];

                    _.each(args, function(arg, key) {

                        var deferred = $q.defer(),
                            prefix = arg.prefix || '',
                            prop = _.merge({
                                key: 'arg' + key,
                                position: arg.position || 0,
                                prefix: prefix,
                                val: ''
                            }, arg);

                        applyTransform(arg.valueFrom, arg.valueFrom, false)
                            .then(function(result) {
                                prop.val = result;
                                deferred.resolve(prop);
                            }, function(error) {
                                deferred.reject(error);
                            });

                        argsPromises.push(deferred.promise);
                    });

                    return $q.all(argsPromises)
                        .then(function(args) {
                            return _.sortBy(inputs.concat(args), 'position');
                        }, function(error) {
                            return $q.reject(error);
                        });

                })
                /* generate command from arguments and inputs and apply transforms on baseCmd */
                .then(function(inputsAndArgs) {

                    function isBlank(val) {
                        return val === '' || _.isNull(val);
                    }

                    var command = [],
                        baseCmdPromises = [];

                    _.each(inputsAndArgs, function(arg) {

                        var separate = parseSeparation(arg.separate),
                            value = _.isUndefined(arg.val) ? '' : arg.val,
                            cmd = '';

                        if (!arg.type || arg.type === 'boolean' || !isBlank(value)) {
                            if (_.isArray(value)) {
                                // set default value for itemSeparator for arguments that haven't been saved with new interface
                                arg.itemSeparator = _.isUndefined(arg.itemSeparator) ? null : arg.itemSeparator;

                                var itemSeparator = parseItemSeparator(arg.itemSeparator),
                                    joiner = _.isNull(itemSeparator) ? (' ' + arg.prefix + separate) : itemSeparator;

                                cmd = arg.prefix + separate + value.join(joiner);
                            } else {
                                cmd = arg.prefix + separate + value;
                            }

                            if (!_.isEmpty(cmd)) {
                                command.push(cmd);
                            }
                        }
                    });

                    _.each(toolJSON.baseCommand, function(baseCmd) {

                        var deferred = $q.defer();

                        applyTransform(baseCmd, baseCmd, false)
                            .then(function(result) {
                                deferred.resolve(result);
                            }, function(error) {
                                deferred.reject(error);
                            });

                        baseCmdPromises.push(deferred.promise);
                    });

                    return $q.all(baseCmdPromises)
                        .then(function(commands) {
                            return {command: command, baseCommand: commands.join(' ')};
                        }, function(error) {
                            return $q.reject(error);
                        });

                })
                /* apply transforms on stdin/stdout */
                .then(function(res) {
                    return $q.all([
                        applyTransform(toolJSON.stdin, toolJSON.stdin),
                        applyTransform(toolJSON.stdout, toolJSON.stdout)
                    ]).then(function(result) {
                        return {
                            command: res.command,
                            baseCommand: res.baseCommand,
                            stdin: result[0],
                            stdout: result[1]
                        };
                    }, function(error) {
                        return $q.reject(error);
                    });
                })
                /* generate final command */
                .then(function(result) {

                    consoleCMD = result.baseCommand + ' ' + result.command.join(' ');

                    if (result.stdin) {
                        consoleCMD += ' < ' + result.stdin;
                    }

                    if (result.stdout) {
                        consoleCMD += ' > ' + result.stdout;
                    }

                    if (_.isFunction(consoleCMDCallback)) {
                        consoleCMDCallback(consoleCMD);
                    }

                    return consoleCMD.trim();

                })
                .catch(function(error) {
                    return $q.reject(error);
                });
        };

        /**
         * Get currently generated command
         *
         * @returns {string}
         */
        var getCommand = function() {

            return consoleCMD;

        };

        /**
         * Subscribe on command generating
         *
         * @param {Function} func
         */
        var subscribe = function(func) {

            consoleCMDCallback = func;

        };

        /**
         * Check if property is required
         *
         * @param {Type} schema
         * @returns {Boolean}
         */
        var isRequired = function(schema) {

            return !(schema.length > 1 && schema[0] === 'null');

        };

        /**
         * Format property according to avro schema
         *
         * @param {object} inner
         * @param {Input|Output} property
         * @param {string} propertyType - 'input' || 'output'
         * @returns {object}
         */
        var formatProperty = function(inner, property, propertyType) {

            var type,
                formatted = {},
                tmp = angular.copy(property);

            /**
             * Strip obsolete params for record array item
             *
             * @param {object} prop
             * @param {string} itemType
             */
            var stripParams = function(prop, itemType) {
                var toStrip = ['prefix', 'separator', 'itemSeparator', 'valueFrom'];

                if (itemType === 'record' && prop.inputBinding) {

                    _.each(toStrip, function(param) {
                        if (angular.isDefined(prop.inputBinding[param])) {
                            delete prop.inputBinding[param];
                        }
                    });
                }

            };

            /* if any level and array */
            if (inner.type === 'array') {

                type = {
                    type: 'array',
                    name: inner.name,
                    items: inner.items
                };

                stripParams(tmp, getItemsType(type.items));


                /* if any level and enum */
            } else if (inner.type === 'enum') {

                type = {
                    type: 'enum',
                    name: inner.enumName,
                    symbols: inner.symbols
                };

            } else if (inner.type === 'map') {

                type = {
                    type: 'map',
                    name: inner.mapName,
                    values: inner.values
                };

                /* every other case */
            } else if (inner.type === 'record') {
                type = {
                    type: 'record',
                    name: inner.recordName,
                    fields: inner.fields
                };

            } else {
                type = inner.type;
            }

            /* check if adapter has empty fields and remove them */
            /* and remove remove adapter property if no adapter is set */

            var adapter = propertyType === 'input' ? 'inputBinding' : 'outputBinding';

            if (tmp[adapter]) {
                _(tmp[adapter]).keys().forEach(function(key) {

                    // _.isEmpty returns true for number values, which we don't want
                    // if there is a number value, then the prop is not empty
                    if (_.isEmpty(tmp[adapter][key]) && !_.isNumber(tmp[adapter][key]) && !_.isBoolean(tmp[adapter][key]) && !_.isNull(tmp[adapter][key])) {
                        if (key !== 'metadata') {
                            delete tmp[adapter][key];
                        }
                    }
                });

                if (_.isEmpty(tmp[adapter])) {
                    delete tmp[adapter];
                }
            }

            /* schema for the first level */
            if (inner.key === 'id') {
                /* format structure for required property */
                tmp.type = inner.required ? [type] : ['null', type];
                formatted = tmp;
                formatted.id = '#' + inner.name;

                /*
                 *  schema for every other level
                 *  under the key "type"
                 */
            } else {
                /* format structure for required property */
                tmp.type = inner.required ? [type] : ['null', type];
                formatted = tmp;
                formatted.name = inner.name;
            }

            return formatted;

        };

        /**
         * Copy property's params in order to preserve reference
         *
         * @param {object} src
         * @param {object} dest
         */
        var copyPropertyParams = function(src, dest) {

            var keys = _.keys(src);

            _.each(src, function(value, key) {
                dest[key] = value;
            });

            _.each(dest, function(value, key) {
                if (!_.contains(keys, key)) {
                    delete dest[key];
                }
            });

        };

        /**
         * Get property template name by its type
         *
         * @param {string} type
         * @returns {*}
         */
        var getTplType = function(type) {
            type = type.toLowerCase();
            var general = ['file', 'string', 'int', 'float', 'boolean', 'map'];

            if (_.contains(general, type)) {
                return 'general';
            } else {
                return type;
            }

        };

        /**
         * Get reference for items
         *
         * @param {string} type
         * @param {Type} schema
         * @returns {*}
         */
        var getItemsRef = function(type, schema) {

            if (type === 'array') {
                var arr = schema[1] || schema[0];
                return arr.items;
            } else {
                return null;
            }

        };

        /**
         * Returns items type from items property.
         *
         * @param items
         * @returns {string} type
         */
        var getItemsType = function(items) {
            if (items) {
                if (typeof items === 'string') {
                    return items;
                } else if (typeof items === 'object' && items.type) {
                    return items.type;
                }
            }
        };

        /**
         * Returns array of fields for records
         *
         * @param {Type} schema
         * @returns {RecordType.fields}
         */
        var getFieldsRef = function(schema) {
            return schema[0] === 'null' ? schema[1].fields : schema[0].fields;
        };

        /**
         * Get property schema depending on the level
         *
         * @param {string} type - input or output
         * @param {Input|Output} property
         * @param {string} toolType - tool or script
         * @param {boolean} ref
         * @returns {Type} type
         */
        var getSchema = function(type, property, toolType, ref) {

            var defaultTypes = {
                input: 'string',
                output: 'File'
            };

            if (_.isEmpty(property)) {
                return (toolType === 'tool') ? ['null', defaultTypes[type]] : ['null', defaultTypes[type]];
            }

            if (_.isUndefined(property.type) && _.isUndefined(property.type)) {
                /*
                 in case of second level inputs where structure is
                 {
                 type: {*},
                 name: {string}
                 adapters: {object}
                 }
                 */
                return ref ? property : angular.copy(property);
            } else {
                return ref ? (property.type || property.type) : (angular.copy(property.type || property.type));
            }
        };

        /**
         * Returns input or output binding for an input or output object
         *
         * @param {Input|Output} property
         * @param {boolean} ref
         * @param {string} type 'input' or 'output'
         * @returns {Binding}
         */
        var getAdapter = function(property, ref, type) {
            if (_.isEmpty(property)) {
                return {};
            }

            var ad = type + 'Binding';

            return ref ? property[ad] : angular.copy(property[ad]);
        };

        return {
            setTool: setTool,
            setJob: setJob,
            getTool: getTool,
            getJob: getJob,
            flush: flush,
            getTransformSchema: getTransformSchema,
            generateCommand: generateCommand,
            generatePreviewCommand: generatePreviewCommand,
            getCommand: getCommand,
            isRequired: isRequired,
            parseType: parseType,
            parseTypeObj: parseTypeObj,
            parseEnum: parseEnum,
            parseName: parseName,
            formatProperty: formatProperty,
            copyPropertyParams: copyPropertyParams,
            getTplType: getTplType,
            getItemsRef: getItemsRef,
            getItemsType: getItemsType,
            getFieldsRef: getFieldsRef,
            getTypes: getTypes,
            getSchema: getSchema,
            getAdapter: getAdapter,
            checkIfEnumNameExists: checkIfEnumNameExists,
            getExpressionRequirement: getExpressionRequirement,
            manageProperty: manageProperty,
            deleteProperty: deleteProperty,
            manageArg: manageArg,
            deleteArg: deleteArg,
            subscribe: subscribe
        };

    }]);
