/**
 * Created by filip on 12/12/14.
 */

'use strict';
angular.module('registryApp.dyole')
    .factory('Formater', ['Const', 'lodash', function(Const, _) {

        var formater = {

            packedSchema: null,

            toRabixSchema: function(j, exposed, values) {

                debugger;

                exposed = exposed || false;
                values = values || false;

                var json = _.clone(j);

                // reset schema
                this.packedSchema = null;
                this.packedSchema = {};

                this.packedSchema['@type'] = 'Workflow';

                this.packedSchema.steps = [];

                this.packedSchema.inputs = {
                    type: 'object',
                    properties: {}
                };

                this.packedSchema.outputs = {
                    type: 'object',
                    properties: {}
                };

                if ((!json.relations || json.relations.length === 0 ) && json.nodes.length === 1) {
                    var _id = json.nodes[0].id;

                    this.packedSchema.steps.push({
                        id: _id,
                        app: json.schemas[_id],
                        inputs: {},
                        outputs: {}
                    });

                } else {
                    this._transformRelationsToSteps(json.relations || [], json.nodes, json.schemas, exposed, values);
                }

                delete json.relations;
                delete json.schemas;
                delete json.nodes;

                json = _.extend(json, this.packedSchema);

                if (json.exposed) {
                    delete json.exposed;
                }


                if (json.values) {

                    delete json.values;
                }

                this.packedSchema = null;

                return json;
            },

            toPipelineSchema: function(j) {

                var json = _.clone(j);

                // reset schema
                this.packedSchema = null;
                this.packedSchema = {};
                this.packedSchema.schemas = {};
                this.packedSchema.nodes = [];
                this.packedSchema.relations = [];
                this.packedSchema.display = json.display;

                this.packedSchema.values = {};
                this.packedSchema.exposed = {};

                this._transformStepsToRelations(json);

                var r = _.cloneDeep(this.packedSchema);

                this.packedSchema = null;

                return r;

            },

            _transformRelationsToSteps: function(relations, nodes, schemas, exposed, values) {

                var _self = this;

                _.forEach(relations, function(rel) {
                    var step, nodeSchema;

                    nodeSchema = schemas[rel.end_node];

                    if (_self._checkSystem(nodeSchema)) {
                        _self._createInOut('outputs', nodeSchema);
                    } else {
                        step = _self._createOneAppStep(rel, nodes, schemas);
                    }

                    if (step) {
                        step.app = _.clone(nodeSchema);

                        if (step.app.x) {
                            delete step.app.x;
                        }
                        if (step.app.y) {
                            delete step.app.y;
                        }

                        _.remove(_self.packedSchema.steps, function(s) {

                            return s.id === step.id;
                        });

                        _self.packedSchema.steps.push(step);
                    }
                });

                this._generateSystemNodes(relations, nodes, schemas);

                if (exposed) {
                    this._addExposedParams(exposed);
                }

                if (values) {
                    this._addValuesToSteps(values);
                }

            },

            _addExposedParams: function(exposed) {
                var packedSchema = this.packedSchema;

                _.forEach(exposed, function(schema, ids) {

                    if (ids.indexOf(Const.exposedSeparator) === -1) {
                        return false;
                    }

                    var h = ids.split(Const.exposedSeparator),
                        node_id = h[0],
                        param_id;

                    if (h.length > 2) {
                        h.shift();
                        param_id = h.join(Const.exposedSeparator);
                    } else {
                        param_id = h[1];
                    }

                    packedSchema.inputs.properties[ids] = schema;

                    var step = _.find(packedSchema.steps, function(s) {
                        return s.id === node_id;
                    });

                    if (step) {

                        step.inputs[param_id] = {
                            $from: ids
                        };

                    } else {
                        throw Error('Step not found to add exposed params to: ' + node_id);
                    }

                });

            },

            _addValuesToSteps: function(values) {
                var steps = this.packedSchema.steps;

                _.forEach(values, function(values, node_id) {

                    var app = _.find(steps, function(step) {
                        return step.id === node_id;
                    });

                    if (app) {

                        _.forEach(values, function(param, param_id) {
                            app.inputs[param_id] = param;
                        });

                    } else {
                        throw Error('App not found to add values to: ' + node_id);
                    }
                });
            },

            _createParamValue: function(params, input_id, node_id) {
                var values = this.packedSchema.values[node_id] = this.packedSchema.values[node_id] || {};
//
//                if (typeof params === 'object') {
//                    _.forEach(params, function (param, param_id) {
//                        values[param_id] = param;
//                    });
//                } else {
                values[input_id] = params;
//                }

            },

            _createExposedParam: function(from, node_id, paramSchema) {
                var exposed = this.packedSchema.exposed = this.packedSchema.exposed || {};

                exposed[from.$from] = paramSchema;
            },

            _generateSystemNodes: function(relations, nodes, schemas) {
                var _self = this;

                _.forEach(relations, function(rel) {

                    var nodeSchema = schemas[rel.end_node];

                    if (_self._checkSystem(nodeSchema)) {

                        _self._attachOutput(rel);

                        _self._createInOut(nodeSchema.softwareDescription.type + 's', nodeSchema);

                    } else {
                        nodeSchema = schemas[rel.start_node];
                    }

                    if (_self._checkSystem(nodeSchema)) {

                        _self._createInOut(nodeSchema.softwareDescription.type + 's', nodeSchema);
                    }

                });
            },

            _checkSystem: function(nodeSchema) {

                return nodeSchema.softwareDescription && nodeSchema.softwareDescription.repo_name === 'system';
            },

            _attachOutput: function(rel) {
                var filter = _.filter(this.packedSchema.steps, function(step) {
                    return step.id === rel.start_node;
                });

                if (filter.length !== 0) {
                    filter[0].outputs[rel.output_name] = {
                        $to: rel.input_name
                    };
                }
            },

            _createInOut: function(type, node) {
                var obj = this.packedSchema[type].properties;

                type = type === 'inputs' ? 'outputs' : 'inputs';

                if (typeof obj[node.id] === 'undefined') {
                    obj[node.id] = node[type].properties[Object.keys(node[type].properties)[0]];
                }

            },

            _createOneAppStep: function(rel, nodes, schemas) {

                var from, exists, step = {};

                var nodeSchema = schemas[rel.end_node];

                step.id = rel.end_node;

                exists = _.filter(this.packedSchema.steps, function(s) {

                    return s.id === step.id;
                });

                if (exists.length !== 0) {
                    step = exists[0];
                } else {
                    step = {
                        id: rel.end_node,
                        app: nodeSchema,
                        inputs: {},
                        outputs: {}
                    };
                }

                from = rel.start_node + '.' + rel.output_name;

                if (this._checkSystem(schemas[rel.start_node])) {
                    from = rel.output_name;
                }

                if (step.inputs[rel.input_name] && typeof step.inputs[rel.input_name].$from === 'string') {

                    var f = step.inputs[rel.input_name].$from,
                        arr = [f];

                    arr.push(from);

                    step.inputs[rel.input_name] = {
                        $from: arr
                    };

                } else {
                    if (step.inputs[rel.input_name] && Array.isArray(step.inputs[rel.input_name].$from)) {
                        step.inputs[rel.input_name].$from.push(from);
                    } else {
                        step.inputs[rel.input_name] = {
                            $from: from
                        };
                    }
                }

                return step;
            },

            /**
             * Transform steps to relation type schema
             *
             * @param json
             * @private
             */
            _transformStepsToRelations: function(json) {

                var _self = this,
                    steps = json.steps,
                    relations = this.packedSchema.relations,
                    nodes = this.packedSchema.nodes,
                    schemas = this.packedSchema.schemas;

                _.forEach(steps, function(step) {
                    var end_node = step.id;

                    if (!schemas[step.id]) {
                        schemas[step.id] = step.app;
                    }

                    step.app.id = step.id;

                    var ex = _.filter(nodes, function(n) {
                        return n.id === step.app.id;
                    });

                    if (ex.length === 0) {
                        nodes.push(step.app);
                    }

                    _self._generateInputsFromStep(json, relations, schemas, nodes, step, end_node);
                    _self._generateOutputsFromStep(json, relations, schemas, nodes, step, end_node);
                });

                _.forEach(nodes, function(model) {

                    // skip system nodes (inputs, outputs)
                    if (model.softwareDescription && model.softwareDescription.repo_name === 'system') {
                        return;
                    }

                    _.forEach(model.inputs.properties, function(input, name) {
                        input.name = name;
                        input.id = input.id || name;
                    });

                    _.forEach(model.outputs.properties, function(output, name) {
                        output.name = name;
                        output.id = output.id || name;
                    });

                });

            },

            _generateInputsFromStep: function(json, relations, schemas, nodes, step, end_node) {
                var _self = this,
                    start_node, output_name, input_name, count = 0;

                _.forEach(step.inputs, function(from, input) {

                    if (typeof from.$from === 'undefined') {

                        _self._createParamValue(from, input, step.id);


                    } else if (typeof from === 'object' && typeof from.$from !== 'undefined' && from.$from.indexOf(Const.exposedSeparator) !== -1) {

                        var h = from.$from.split(Const.exposedSeparator),
                            param_id;

                        if (h.length > 2) {
                            h.shift();
                            param_id = h.join(Const.exposedSeparator);
                        } else {
                            param_id = h[1];
                        }


                        var paramSchema = step.app.inputs.properties[param_id];

                        _self._createExposedParam(from, step.id, paramSchema);

                    } else {

                        if (!_.isArray(from.$from)) {
                            from.$from = [from.$from];
                        }

                        _.forEach(from.$from, function(fr) {

                            var relation, s, filter;

                            s = fr.split('.');

                            if (s.length !== 1) {
                                start_node = s[0];
                                output_name = s[1];
                            } else {
                                var input_id;

                                filter = _.filter(json.inputs.properties, function(input, id) {
                                    if (input.id === s[0]) {
                                        input_id = id;
                                    }
                                    return input.id === s[0];
                                });

                                if (filter.length !== 0) {
                                    var m = _self._generateIOSchema('input', filter[0], input_id);

                                    m.name = input_id;
                                    schemas[input_id] = m;

                                    nodes.push(m);

                                    start_node = input_id;
                                } else {
                                    start_node = '';
                                    throw new Error('Invalid Input name: ' + s[0]);
                                }

                                output_name = s[0];
                            }

                            input_name = input;

                            relation = {
                                end_node: end_node,
                                input_name: input_name,
                                output_name: output_name,
                                start_node: start_node,
                                type: 'connection',
                                // id needs to be a string
                                id: _.random(100000, 999999) + ''
                            };

                            relations.push(relation);

                        });
                    }

                });
            },

            _generateOutputsFromStep: function(json, relations, schemas, nodes, step, end_node) {
                var _self = this,
                    start_node, output_name, input_name,
                    cached_end_node = end_node;

                _.forEach(step.outputs, function(to, output) {
                    var relation, filter, output_id;

                    start_node = cached_end_node;
                    output_name = output;

                    input_name = to.$to;
                    filter = _.filter(json.outputs.properties, function(out, id) {
                        if (out.id === input_name) {
                            output_id = id;
                        }
                        return out.id === input_name;
                    });

                    if (filter.length !== 0) {

                        var m = _self._generateIOSchema('output', filter[0], output_id);

                        if (!schemas[output_id]) {
                            m.name = output_id;
                            schemas[output_id] = m;
                        }

                        var ex = _.filter(nodes, function(n) {
                            return n.id === output_id;
                        });

                        if (ex.length === 0) {
                            nodes.push(m);
                        }

                        end_node = output_id;
                    } else {
                        end_node = '';
                        throw 'Invalid Output name';
                    }

                    relation = {
                        end_node: end_node,
                        input_name: input_name,
                        output_name: output_name,
                        start_node: start_node,
                        type: 'connection',
                        // id needs to be a string
                        id: _.random(100000, 999999) + ''
                    };

                    relations.push(relation);

                });

            },

            _generateIOSchema: function(type, schema, id) {

                var internalType = type === 'input' ? 'outputs' : 'inputs';

                var model = {
                    'name': schema.name || 'System app',
                    'softwareDescription': {
                        'repo_owner': 'rabix',
                        'repo_name': 'system',
                        'type': type,
                        'name': schema.name
                    },
                    'documentAuthor': null,
                    'inputs': {
                        type: 'object'
                    },
                    'outputs': {
                        type: 'object'
                    }
                };

                model[internalType].properties = {};
                model[internalType].properties[schema.id] = schema;

                model[internalType].properties[schema.id].name = schema.id;
                model[internalType].properties[schema.id].id = schema.id;

                model.id = id;

                return model;
            }

        };

        return formater;

    }]);
