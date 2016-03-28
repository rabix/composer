/**
 * Created by filip on 2/6/15.
 *
 * Formatter Module
 * - Used for rabix workflow schema transformation
 */

'use strict';
angular.module('registryApp.dyole')
    .factory('FormaterD2', ['Const', 'common', 'lodash', function(Const, Common, _) {

        var fs = {};

        /**
         * Bare Rabix schema model
         *
         * @type {{class: string, steps: Array, dataLinks: Array, inputs: Array, outputs: Array}}
         */
        var RabixModel = {
            'class': 'Workflow',
            'steps': [],
            'requirements': [],
            'dataLinks': [],
            'inputs': [],
            'outputs': []
        };

        var MetadataRequirement = {
            "class": "sbg:Metadata"
        };

        /**
         * Common used stuff
         *
         * @type {{fileFilter: string[], _fileTypeCheck: _fileTypeCheck, checkTypeFile: checkTypeFile}}
         * @private
         */
        var _common = Common;

        /**
         * Main formatter
         *
         * @type {{toRabixRelations: toRabixRelations, createSteps: createSteps, createWorkflowInOut: createWorkflowInOut, _checkStepExists: _checkStepExists, createInOutNodes: createInOutNodes, toPipelineRelations: toPipelineRelations, createSchemasFromSteps: createSchemasFromSteps, _generateIOSchema: _generateIOSchema}}
         * @private
         */
        var _formatter = {

            /**
             * ---------------------
             * Rabix Schema Creation
             * ---------------------
             */

            /**
             * Create data links from relations
             *
             * @param relations
             * @param exposed
             * @param workflow
             * @param suggestedValues
             * @param schemas
             * @returns {Array}
             */
            toRabixRelations: function(relations, exposed, workflow, suggestedValues, schemas) {
                var _self = this,
                    dataLinks = [];

                _.forEach(relations, function(rel) {
                    var dataLink = {
                        source: '',
                        destination: ''
                    };

                    if (typeof rel.position !== 'undefined') {
                        dataLink.position = rel.position;
                    }

                    if (rel.input_name === rel.end_node && Common.checkSystem(schemas[rel.end_node])) {
                        dataLink.destination = rel.end_node;
                    } else {
                        dataLink.destination = rel.end_node + Const.generalSeparator + rel.input_name.slice(1);
                    }

                    if (rel.output_name === rel.start_node && Common.checkSystem(schemas[rel.start_node])) {
                        dataLink.source = rel.start_node;
                    } else {
                        dataLink.source = rel.start_node + Const.generalSeparator + rel.output_name.slice(1);
                    }

                    dataLinks.push(dataLink);
                });

                _.forEach(exposed, function(schema, ids) {

                    var dataLink = {
                        source: '',
                        destination: ''
                    };

                    var input_id = '#' + ids.split(Const.exposedSeparator)[1];

                    if (typeof suggestedValues[ids] !== 'undefined') {
                        schema['sbg:suggestedValue'] = suggestedValues[ids];
                    }

                    dataLink.destination = ids.replace(Const.exposedSeparator, Const.generalSeparator);

                    input_id = _self._createWorkflowInput(input_id, schema, workflow);

                    dataLink.source = input_id;

                    dataLinks.push(dataLink);

                });

                return dataLinks;
            },

            _createWorkflowInput: function(id, schema, workflow) {
                var _self = this,
                    flag = false;

                var model = {
                    'id': id
                };

                model = _.extend(schema, model);

                if (model.name) {
                    delete model.name;
                }

                var n = 0;

                while (!flag) {

                    if (!_self._checkIdUniqe(model.id, workflow.inputs) && !_self._checkIdUniqe(model.id, workflow.outputs)) {
                        flag = true;
                    } else {
                        n++;
                        model.id = id + '_' + n;
                    }

                }

                workflow.inputs.push(model);

                return model.id;
            },

            _checkIdUniqe: function(id, array) {
                return _.find(array, function(item) {
                    return item.id === id;
                });
            },

            /**
             * Create Rabix Steps from node schemas
             *
             * @param {Array} schemas
             * @returns {Array}
             */
            createSteps: function(schemas) {

                var _self = this,
                    steps = [];

                _.forEach(schemas, function(sc, appId) {

                    var schema = _.clone(sc),
                        id = appId,
                        step = {
                            'id': id,
                            run: schema.ref || schema,
                            inputs: [],
                            outputs: []
                        };

                    step['sbg:x'] = step.run.display.x;
                    step['sbg:y'] = step.run.display.y;
                    delete step.run.display;

                    if (typeof schema.scatter !== 'undefined' && typeof schema.scatter === 'string') {
                        step.scatter = id + Const.generalSeparator + schema.scatter.slice(1);
                        delete schema.scatter;
                    }

                    if (schema.ref) {
                        delete schema.ref;
                    }

                    if (step.run.appId) {
                        step.run.id = step.run.appId;
                        delete step.run.appId;
                    }

                    if (!_common.checkSystem(schema)) {

                        _.forEach(schema.inputs, function(input) {
                            step.inputs.push({
                                'id': id + Const.generalSeparator + input['id'].slice(1, input['id'].length)
                            });
                        });

                        _.forEach(schema.outputs, function(output) {
                            step.outputs.push({
                                'id': id + Const.generalSeparator + output['id'].slice(1, output['id'].length)
                            });
                        });

                        if (!_self._checkStepExists(steps, id)) {
                            steps.push(step);
                        }

                    }

                });

                return steps;
            },

            /**
             * Add values to step inputs if values set
             *
             * @param steps
             * @param values
             */
            addValuesToSteps: function(steps, values) {

                _.forEach(values, function(inputs, stepId) {
                    if (typeof stepId !== 'undefined') {

                        var step = _.find(steps, function(s) {
                            return s['id'] === stepId;
                        });

                        if (typeof step !== 'undefined') {
                            _.forEach(inputs, function(val, input_id) {

                                var inp = _.find(step.inputs, function(i) {
                                    return i['id'] === step['id'] + Const.generalSeparator + input_id.slice(1);
                                });

                                if (typeof inp !== 'undefined') {
                                    inp.default = val;
                                } else {
                                    console.error('Invalid input id to attach values to', input_id);
                                }
                            });
                        }
                    }
                });

            },

            /**
             * Create Workflow inputs and outputs
             *
             * @param workflow
             * @param schemas
             */
            createWorkflowInOut: function(workflow, schemas) {

                _.forEach(schemas, function(schema) {

                    var type, schemaFinal;

                    if (_common.checkSystem(schema)) {
                        var internalType;
                        type = schema.softwareDescription.type;
                        delete schema.softwareDescription;

                        _.forEach(schema.inputs, function(inp) {
                            delete inp.name;
                        });

                        _.forEach(schema.outputs, function(out) {
                            delete out.name;
                        });

                        internalType = type === 'input' ? 'outputs' : 'inputs';

                        if (typeof schema.suggestedValue !== 'undefined' && _.isArray(schema.suggestedValue) && schema.suggestedValue.length > 0) {
                            var values = schema[internalType][0]['sbg:suggestedValue'] = [];

                            var s = schema[internalType][0].type[1] || schema[internalType][0].type[0];
                            var isArray = s.type && s.type === 'array';

                            if (isArray) {
                                _.forEach(schema.suggestedValue, function(val) {
                                    //console.log('Name %s, id %s', val.name, val.id);
                                    values.push({
                                        class: 'File',
                                        name: val.name,
                                        path: val.id
                                    });
                                });
                            } else {
                                //console.log('Name %s, id %s', schema.suggestedValue[0].name, schema.suggestedValue[0].id);

                                schema[internalType][0]['sbg:suggestedValue'] = {
                                    class: 'File',
                                    name: schema.suggestedValue[0].name,
                                    path: schema.suggestedValue[0].id
                                };
                            }

                        }

                        schemaFinal = schema[internalType][0];

                        schemaFinal['sbg:x'] = schema.display.x;
                        schemaFinal['sbg:y'] = schema.display.y;
                        schemaFinal.label = schema.label;

                        workflow[type + 's'].push(schemaFinal);
                    }
                });

            },

            /**
             * Check if step allready exists
             *
             * @param steps
             * @param id
             * @private
             */
            _checkStepExists: function(steps, id) {
                var exists = _.find(steps, function(step) {
                    return step['id'] === id;
                });

                return typeof exists !== 'undefined';
            },

            /**
             * ---------------------
             * Pipeline Schema Creation
             * ---------------------
             */
            createInOutNodes: function(schemas, workflow) {

                var _self = this,
                    system = {};

                if (!_.isArray(workflow.inputs)) {
                    workflow.inputs = new Array(workflow.inputs);
                }

                _.forEach(workflow.inputs, function(input) {
                    var id = input['id'];

                    if (_common.checkTypeFile(input.type[1] || input.type[0]) || input['sbg:includeInPorts']) {
                        system[id] = _self._generateIOSchema('input', input, id);
                    }
                });

                if (!_.isArray(workflow.outputs)) {
                    workflow.outputs = new Array(workflow.outputs);
                }

                _.forEach(workflow.outputs, function(output) {
                    var id = output['id'];

                    if (_common.checkTypeFile(output.type[1] || output.type[0]) || output['sbg:includeInPorts']) {
                        system[id] = _self._generateIOSchema('output', output, id);
                    }
                });

                return _.assign(schemas, system);

            },

            toPipelineRelations: function(schemas, dataLinks, exposed, workflow, suggestedValues) {

                var relations = [];

                function checkTypeFile(src, dest) {

                    var input, schema,
                        node_id = dest[0],
                        input_id = dest.length === 1 ? dest[0] : '#' + dest[1],
                        node = schemas[node_id];

                    input = _.find(node.inputs, function(i) {
                        return i['id'] === input_id;
                    });

                    if (typeof input !== 'undefined') {
                        schema = input.type[1] || input.type[0];

                        return input['sbg:includeInPorts'] ? true : _common.checkTypeFile(schema);
                    } else {
                        //console.log('Input %s not found on node %s', input_id, node_id);
                    }

                    return false;
                }

                _.forEach(dataLinks, function(dataLink) {
                    var dest = dataLink.destination.split(Const.generalSeparator),
                        src = dataLink.source.split(Const.generalSeparator),
                        relation = {
                            input_name: '',
                            start_node: '',
                            output_name: '',
                            end_node: '',
                            id: _.random(100000, 999999) + '', // it has to be a string
                            type: 'connection'
                        };

                    if (checkTypeFile(src, dest)) {

                        if (src.length === 1) {
                            relation.output_name = relation.start_node = src[0];
                        } else {
                            relation.output_name = '#' + src[1];
                            relation.start_node = src[0];
                        }

                        if (dest.length === 1) {
                            relation.input_name = relation.end_node = dest[0];
                        } else {
                            relation.input_name = '#' + dest[1];
                            relation.end_node = dest[0];
                        }

                        if (typeof dataLink.position !== 'undefined') {
                            relation.position = dataLink.position;
                        }

                        relations.push(relation);

                    } else {
//                        if (src.length === 1) {
                        src = src[0];

                        var ex = _.find(workflow.inputs, function(i) {
                            return i['id'] === src;
                        });

                        if (typeof ex !== 'undefined') {
                            var keyName = dest[0] + Const.exposedSeparator + dest[1];
                            //remove # with slice in front of input id (cliche form builder required)
                            exposed[keyName] = ex;

                            var sugValue = ex['sbg:suggestedValue'];
                            if (typeof sugValue !== 'undefined') {
                                suggestedValues[keyName] = sugValue;
                            }

                        } else {
                            console.error('Param exposed but not set in workflow inputs');
                        }

//                        } else {
//                            console.error('Param must be exposed as workflow input');
//                        }
                    }


                });

                return relations;

            },

            createSchemasFromSteps: function(steps, values) {
                var schemas = {};

                _.forEach(steps, function(step) {

                    var stepId = step['id'], ref;

                    if (typeof step.run === 'string') {
                        ref = step.run;
                        step.run = resolveApp(step.run);
                        step.run.ref = ref;
                    }

                    step.run.appId = step.run.id;
                    step.run.id = stepId;
                    step.run.display = {
                        x: step['sbg:x'],
                        y: step['sbg:y']
                    };

                    if (typeof step.scatter !== 'undefined' && typeof step.scatter === 'string') {
                        step.run.scatter = '#' + step.scatter.split(Const.generalSeparator)[1];
                    }

                    schemas[stepId] = step.run;

                    // Check if values are set on step inputs
                    // and attach them to values object
                    _.forEach(step.inputs, function(input) {
                        if (input.default) {
                            var input_id = '#' + input['id'].split(Const.generalSeparator)[1],
                                obj;

                            values[stepId] = values[stepId] || {};

                            obj = values[stepId];

                            obj[input_id] = input.default;
                        }
                    });
                });

                return schemas;
            },

            /**
             * Generate schema for single input/output node
             * @param {string} type
             * @param {object} schema
             * @param {string} id
             * @param {string} [terminalId]
             * @returns {{id: string, suggestedValue: Array, description: string, display: {x: number, y: number}, sbg:createdBy: string, label: (*|string), softwareDescription: {repo_owner: string, repo_name: string, type: *, name: *, label: *}, inputs: Array, outputs: Array}}
             * @private
             */
            _generateIOSchema: function(type, schema, id, terminalId) {

                var internalType = type === 'input' ? 'outputs' : 'inputs';

                schema.id = terminalId || id; // ID of the socket/terminal

                schema.label = schema.label || id;

                var descriptions = {
                    input: '###*Input*' + '\n' + 'Downloads input files to local cluster for further processing.',
                    output: '###*Output*' + '\n' + 'Uploads resulting files from processing cluster to user storage.'
                };

                var suggestedValue = [];

                if (typeof schema['sbg:suggestedValue'] !== 'undefined') {

                    var s = schema.type[1] || schema.type[0];
                    var isArray = s.type && s.type === 'array';

                    if (isArray) {
                        _.forEach(schema['sbg:suggestedValue'], function(value) {
                            value.id = value.path;
                            suggestedValue.push(value);
                        });
                    } else {
                        schema['sbg:suggestedValue'].id = schema['sbg:suggestedValue'].path;
                        suggestedValue.push(schema['sbg:suggestedValue']);
                    }

                    delete schema['sbg:suggestedValue'];
                }


                var model = {
                    'id': id, // ID of the node
                    'suggestedValue': suggestedValue,
                    description: descriptions[type],
                    display: {
                        x: schema['sbg:x'],
                        y: schema['sbg:y']
                    },
                    'sbg:createdBy': 'SBG',
                    'label': schema.label || 'Rabix System app',
                    'softwareDescription': {
                        'repo_owner': 'rabix',
                        'repo_name': 'system',
                        'type': type,
                        'name': schema.label,
                        'label': schema.label
                    },
                    'inputs': [],
                    'outputs': []
                };

                model[internalType].push(schema);

                model.id = id;

                return model;
            },

            createNodeIds: function(nodes) {
                var filter = ['https://', 'http://'];

                function checkUrl(id) {
                    var r = false;

                    _.forEach(filter, function(f) {
                        if (_.contains(id, f)) {
                            r = true;
                        }
                    });

                    return r;
                }

                _.forEach(nodes, function(node) {
                    var _id = node['id'];

                    if (!_id || checkUrl(_id)) {
                        _id = node.label;
                    }

                    node.id = _id;

                    //console.log('Node: %s; Node id: %s', node.label, node.id);
                });

                return nodes;
            },

            createDataLinks: function(json) {
                json.dataLinks = [];

                var dataLinks = [];
                var steps = json.steps;
                var outputs = json.outputs;

                _.forEach(steps, function(step) {
                    _.forEach(step.inputs, function(input) {
                        if (_.isArray(input.source)) {
                            input.source = _.unique(input.source);
                            _.forEach(input.source, function(src, position) {

                                var dataLink = {
                                    source: src,
                                    destination: input.id,
                                    position: position + 1
                                };

                                dataLinks.push(dataLink);
                            });

                            input.source = null;
                            delete input.source;
                        }
                    });
                });


                _.forEach(outputs, function(output) {
                    if (_.isArray(output.source)) {
                        output.source = _.unique(output.source);
                        _.forEach(output.source, function(src, position) {

                            var dataLink = {
                                source: src,
                                destination: output.id,
                                position: position + 1
                            };

                            dataLinks.push(dataLink);
                        });

                        output.source = null;
                        delete output.source;
                    }
                });

                return dataLinks;
            },

            dataLinksToSource: function(json) {
                var dataLinks = json.dataLinks;

                var grouped = _.groupBy(dataLinks, function(link) {
                    return link.destination;
                });

                _.forEach(grouped, function(links, group) {

                    var node;
                    var split = group.split('.');

                    if (split.length === 1) {

                        node = _.find(json.outputs, function(output) {
                            return output.id === group;
                        });

                    } else {

                        var step = _.find(json.steps, function(step) {
                            return step.id === split[0];
                        });

                        node = _.find(step.inputs, function(inp) {
                            return inp.id === group;
                        });

                    }


                    node.source = node.source || [];

                    links.sort(function(a, b) {
                        var posA = a.position || 9999;
                        var posB = b.position || 9999;

                        if (posA < posB) {
                            return -1;
                        }
                        if (posB < posA) {
                            return 1;
                        }

                        return 0;
                    });

                    _.forEach(links, function(link) {
                        node.source.push(link.source);
                    });
                })

            }

        };

        /**
         * Helper for creating missing display property when importing json thats not generated by registrys workflow editor
         *
         * @type {{sysCoords: {x: number, y: number}, const: {gap: number}, _findMax: _findMax, _findMiddleY: _findMiddleY, _generateSystemNodeCoords: _generateSystemNodeCoords, _generateNodeCoords: _generateNodeCoords, generateNodesCoords: generateNodesCoords, _fixSystemNodesCoords: _fixSystemNodesCoords, setupDisplay: setupDisplay}}
         * @private
         */
        var _helper = {

            sysCoords: {
                x: 0,
                y: 0
            },

            const: {
                gap: 100
            },

            _findMax: function(display) {

                var nodes = display.nodes, m = 200;

                _.forEach(nodes, function(dis) {
                    if (dis.x > m) {
                        m = dis.x;
                    }
                });

                return m + this.const.gap;
            },

            _findMiddleY: function(display) {
                var nodes = display.nodes, min = 0, max = 400;

                _.forEach(nodes, function(dis) {

                    if (dis.y > max) {
                        max = dis.y;
                    }

                    if (dis.y < min) {
                        min = dis.y;
                    }

                });

                return (max - min) / 2;
            },

            _generateSystemNodeCoords: function(node, display) {
                var x = 100,
                    y = 100,
                    isInput;

                if (!_common.checkSystem(node)) {
                    return false;
                }

                isInput = node.softwareDescription.type === 'input';

                if (!isInput) {
                    x = this._findMax(display);
                }

                this.sysCoords.y += this.const.gap;

                y = this.sysCoords.y;

                return {
                    x: x,
                    y: y
                };

            },

            /**
             * Calculate node coordinates by putting it
             * on the most right point in X axis and in the middle of Y axis.
             *
             * @param {Object} node
             * @param {Object} display
             * @returns {{x: number, y: number}}
             * @private
             */
            _generateNodeCoords: function(node, display) {
                var coords = {
                    x: 0,
                    y: 0
                };

                if (_common.checkSystem(node)) {
                    return;
                }

                coords.x = this._findMax(display);
                coords.y = this._findMiddleY(display);

                return coords;
            },

            /**
             * If display for node exists, push it into display.nodes object.
             * Otherwise, set default value.
             *
             * @param {Object} display
             * @param {Object} nodes
             * @private
             */
            _generateNodesCoords: function(display, nodes) {
                var _self = this;

                _.forEach(nodes, function(node) {
                    var nodeId = node['id'],
                        dis = node.display,
                        coords;

                    if (!dis || (!dis.x && !dis.y)) {

                        coords = _self._generateNodeCoords(node, display);
                        if (coords) {
                            display.nodes[nodeId] = coords;
                        }
                    }
                    else {
                        display.nodes[nodeId] = dis;
                    }
                });
            },

            /**
             * Set display object with canvas' and nodes' coordinates
             *
             * @param {Object} workflow
             * @param {Object[]} nodes
             * @returns {{canvas: {}, nodes: {x: number, y: number, zoom: number}}}
             */
            setupDisplay: function(workflow, nodes) {

                var display = {
                    nodes: {},
                    canvas: {}
                };

                this.sysCoords.x = 0;
                this.sysCoords.y = 0;

                display.canvas = {
                    x: workflow['sbg:canvas_x'] || 0,
                    y: workflow['sbg:canvas_y'] || 0,
                    zoom: workflow['sbg:canvas_zoom'] || 1
                };

                this._generateNodesCoords(display, nodes);

                return display;
            }
        };

        var _mergeSBGProps = function(json, model) {
            _.forEach(json, function(val, key) {
                if (key.indexOf('sbg') !== -1) {
                    model[key] = val;
                }
            });

            return model;
        };

        /**
         * Public exposed formatter methods
         *
         * @type {{toRabixSchema: toRabixSchema, toPipelineSchema: toPipelineSchema}}
         */
        var fd2 = {

            toRabixSchema: function(p, exposed, values, suggestedValues) {

                var json = _.clone(p, true),
                    model = _.clone(RabixModel, true);

                model.dataLinks = _formatter.toRabixRelations(json.relations, exposed, model, suggestedValues, json.schemas);
                model.steps = _formatter.createSteps(json.schemas);

                _formatter.addValuesToSteps(model.steps, values);

                _formatter.createWorkflowInOut(model, json.schemas, json.relations);

                model = _mergeSBGProps(json, model);
                model['id'] = json['id'] || model['id'];
                model.label = json.label || model.label;
                model.description = json.description || '';
                model.hints = json.hints;
                model['sbg:canvas_x'] = json.display.canvas.x;
                model['sbg:canvas_y'] = json.display.canvas.y;
                model['sbg:canvas_zoom'] = json.display.canvas.zoom;

                _formatter.dataLinksToSource(model);

                delete model.display;
                delete model.dataLinks;
                delete model['sbg:name'];

                if (json.requireSBGMetadata) {
                    model.requirements.push(_.clone(MetadataRequirement, true));
                }

                return model;
            },

            toPipelineSchema: function(p) {

                var json = _.clone(p, true),
                    relations, nodes, schemas, display,
                    exposed = {},
                    suggestedValues = {},
                    values = {},
                    idParts = [];

                json.dataLinks = _formatter.createDataLinks(json);

                schemas = _formatter.createSchemasFromSteps(json.steps, values);

                //extend schemas with inputs and outputs
                schemas = _formatter.createInOutNodes(schemas, json, values);

                //clone schemas to create nodes to manipulate on them
                nodes = _.toArray(_.clone(schemas, true));

                display = _helper.setupDisplay(json, nodes);

                relations = _formatter.toPipelineRelations(schemas, json.dataLinks, exposed, json, suggestedValues);

                var requireMetadata = _.find(json.requirements, function(req) {
                    return req.class === MetadataRequirement.class;
                });

                var model = {
                    hints: json.hints || [],
                    requireSBGMetadata: typeof requireMetadata !== 'undefined',
                    exposed: exposed,
                    values: values,
                    suggestedValues: suggestedValues,
                    display: display,
                    nodes: nodes,
                    schemas: schemas,
                    relations: relations
                };

                if (json['sbg:id']) {
                    idParts = json['sbg:id'].split('/');
                }

                model.id= json['sbg:id'] || json.id || '';
                model.label = json.label || json['sbg:id'];
                model['sbg:name'] = idParts[2] || json.label;
                model.description = json.description || '';
                model = _mergeSBGProps(json, model);

                return model;
            }
        };

        return fd2;
    }]);
