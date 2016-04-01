/**
 * Created by filip on 9.10.14..
 */

'use strict';

angular.module('registryApp.dyole')
    .factory('node', ['$rootScope', 'terminal', 'Const', 'common', 'Notification', 'lodash', 'Globals', function($rootScope, Terminal, Const, Common, Notification, _, Globals) {

        var Node = function(options) {

            this.canvas = options.canvas;

            this.parent = options.pipelineWrap;
            this.Pipeline = options.pipeline;

            // node instance on canvas
            this.el = null;
            this.model = options.model;

            this.inputs = [];
            this.outputs = [];

            this.id = this.model.label;

            // map of connections connected to current node
            this.connections = {};

            // dragged flag
            this.dragged = false;

            // destroyed flag
            // used when deleting node can occure from multiple places
            this.destroyed = false;

            this.selected = false;

            //this.isOutdated = this._checkNodeOutdated();
            this.isOutdated = true; // make all of them outdated so you can work simultaniusly without overhead of checking

            this.inputRefs = this.model.inputs;

            this.inputRefs.sort(function(a, b) {
                if (a.id < b.id) {
                    return 1;
                }
                if (b.id < a.id) {
                    return -1;
                }
                return 0;
            });

            this.outputRefs = this.model.outputs;

            this.outputRefs.sort(function(a, b) {
                if (a.id < b.id) {
                    return 1;
                }
                if (b.id < a.id) {
                    return -1;
                }
                return 0;
            });

            this._initTerminals();

        };

        Node.prototype = {

            constraints: {

                radius: 48,
                borderWidth: 10,
                labelOffset: 15,

                outdated: {
                    //fill: '#F5AB35',
                    //fill: '#86b0d4',
                    //fill: '#2b7450',
                    fill: '#29567D', //@todo making color the same as non-update nodes while all nodes are can always be updated

                    gradient: ''
                },

                deleted: {
                    fill: 'red',
                    gradient: ''
                },

                selected: {
                    //                    gradient: '270-#3F7EB6-#7BA7CD'
                    fill: '#F0AD4E'
                },

                //defaults
                //                fill: '270-#3F7EB6-#7BA7CD',
                fill: '#29567D',
                stroke: 'none'
                //                gradient: '90-#A3A3A3-#7A7A7A'

            },

            icons: {
                input: '/editors/app/' + 'images/icon-input-1.png',
                output: '/editors/app/' + 'images/icon-output-2.png',
                workflow: '/editors/app/' + 'images/icon-workflow.png',
                script: '/editors/app/' + 'images/script.png',
                cmd: '/editors/app/' + 'images/cmd.png',
                default: '/editors/app/' + 'images/logo.png'
            },

            buttons: {
                radius: 14,
                border: 4,

                // if you want to change buttons distance from node uncomment and change distance
                //            distance: 5,

                info: {
                    fill: '#3FC380',
                    disabled: '#ccc',

                    image: {
                        name: 'icon-info.png',
                        width: 6,
                        height: 11
                    }

                },

                delete: {
                    fill: '#EF4836',

                    image: {
                        name: 'icon-delete.png',
                        width: 10,
                        height: 10
                    }

                },

                update: {
                    fill: '#ffffff',
                    disabled: '#ccc',

                    image: {
                        name: 'icon-update.png',
                        width: 10,
                        height: 10
                    }

                },

                rename: {
                    fill: 'transparent',

                    image: {
                        name: 'icon-pencil.png',
                        width: 12,
                        height: 12
                    }
                }
            },

            render: function() {

                var self = this,
                    model = this.model,
                    canvas = this.canvas,

                    radius = this.constraints.radius,
                    borderWidth = this.constraints.borderWidth,
                    labelOffset = this.constraints.labelOffset,
                    inputs = this.inputs,
                    outputs = this.outputs,

                    node, outerBorder, innerBorder, borders, label, icon, img,
                    imgUrl;

                node = canvas.group();

                outerBorder = canvas.circle(0, 0, radius);
                outerBorder.attr({
                    //                    fill: '90-#F4F4F4-#F4F4F4:50-#F4F4F4:50-#F4F4F4',
                    fill: '#FBFCFC',
                    stroke: '#dddddd'
                });

                innerBorder = canvas.circle(0, 0, radius - borderWidth);
                innerBorder.attr({
                    fill: this.constraints.fill,
                    stroke: this.constraints.stroke
                    //                    gradient: this.constraints.gradient
                });

                borders = canvas.group();
                borders.push(outerBorder).push(innerBorder);

                var name = model.label ? model.label : model.id;

                if (model.softwareDescription && model.softwareDescription.label) {
                    name = model.softwareDescription.label.charAt(0) === '#' ? model.softwareDescription.label.slice(1) : model.softwareDescription.label || model.softwareDescription.name;
                }

                label = canvas.text(0, radius + labelOffset, name);

                label.attr({
                    'font-size': 14
                });

                imgUrl = this.icons.default;
                var modification = {
                    left: 0,
                    top: 0
                };

                switch (model['class']) {
                    case 'Workflow':
                        imgUrl = this.icons.workflow;
                        break;
                    case 'CommandLineTool':
                        imgUrl = this.icons.cmd;
                        break;
                    case 'ExpressionTool':
                        imgUrl = this.icons.script;
                        break;
                    default:
                        imgUrl = this.icons.default;
                        break;
                }

                if (Common.checkSystem(model)) {
                    if (this.inputs.length === 0) {
                        imgUrl = this.icons.input;
                        modification.left = -2;
                        modification.top = -1;
                    } else {
                        imgUrl = this.icons.output;
                        modification.left = 1;
                    }
                }

                img = new Image();
                img.src = imgUrl;

                $(img).load(function() {
                    icon = canvas.image(imgUrl, -img.width / 2 + modification.left, -img.height / 2 + modification.top, img.width, img.height);
                    borders.push(icon);

                    self._attachEvents();
                });


                // add all elements to the group container
                node.push(borders).push(label);

                // render input terminals
                _.forEach(inputs, function(terminal) {
                    node.push(terminal.render().el);
                });

                // render output terminals
                _.forEach(outputs, function(terminal) {
                    node.push(terminal.render().el);
                });

                // move node to the coordinates written in it's model
                node.translate(model.x, model.y);

                this.el = node;
                this.label = label;
                this._innerBorder = innerBorder;
                this._outerBorder = outerBorder;
                this.circle = borders;

                return this;
            },

            reRenderTerminals: function() {

                var _self = this,
                    node = this.el,
                    connections = [];

                _.forEach(this.connections, function(c) {
                    connections.push(c.model);
                    c.destroy(false);
                });

                _.forEach(this.inputs, function(input) {
                    input.destroy();
                });

                _.forEach(this.outputs, function(output) {
                    output.destroy();
                });

                this.inputs = [];
                this.outputs = [];

                this._initTerminals();

                // render input terminals
                _.forEach(this.inputs, function(terminal) {
                    node.push(terminal.render().el);
                });

                // render output terminals
                _.forEach(this.outputs, function(terminal) {
                    node.push(terminal.render().el);
                });

                var toRemove = [];
                _.forEach(connections, function(connection) {

                    var inp = _.find(_self.inputs, function(input) {
                        return input.model.id === connection.input_name;
                    });

                    if (!inp && connection.end_node === _self.model.id) {
                        toRemove.push(connection.id);
                    }
                });

                _.remove(connections, function(connection) {
                    return toRemove.indexOf(connection.id) !== -1;
                });

                this._restoreConnections(connections);
            },

            _checkNodeOutdated: function() {

                if (Common.checkSystem(this.model)) {
                    return false;
                }

                return this.model['sbg:revision'] !== this.model['sbg:latestRevision'];
            },

            _restoreConnections: function(connections) {
                var _self = this;
                _.forEach(connections, function(cModel) {
                    _self.Pipeline.createConnectionFromModel(cModel);
                });
            },

            _filterInputs: function() {
                var inputs = [];

                _.each(this.inputRefs, function(input) {

                    if (Common.checkTypeFile(input.type[1] || input.type[0]) || input['sbg:includeInPorts']) {
                        input.required = typeof input.type === 'string' ? true : input.type.length === 1;
                        inputs.push(input);
                    }

                });

                return inputs;
            },

            _initTerminals: function() {
                var canvas = this.canvas,
                    inputs = this.inputs,
                    outputs = this.outputs,
                    modelInputs = this._filterInputs(),
                    modelOutputs = this.outputRefs,
                    radius = this.constraints.radius,
                    inputStartingAngle = 120,
                    outputStartingAngle = -60,
                    inputsLen = modelInputs.length,
                    outputsLen = modelOutputs.length,
                    i, inputsAngles, data, outputsAngles;

                if (inputsLen > 0) {
                    inputsAngles = this._calculateTerminalAngles(inputsLen,
                        inputStartingAngle, radius, true);
                }

                for (i = 0; i < inputsLen; i++) {

                    data = _.extend({
                        x: inputsAngles[i].x,
                        y: inputsAngles[i].y,
                        input: true
                    }, modelInputs[i]);

                    inputs.push(Terminal.getInstance({
                        model: data,
                        parent: this,
                        canvas: canvas,
                        pipeline: this.Pipeline,
                        pipelineWrap: this.parent
                    }));
                }

                if (outputsLen > 0) {
                    outputsAngles = this._calculateTerminalAngles(outputsLen,
                        outputStartingAngle, radius, false);
                }

                for (i = 0; i < outputsLen; i++) {

                    data = _.extend({
                        x: outputsAngles[i].x,
                        y: outputsAngles[i].y,
                        input: false
                    }, modelOutputs[i]);

                    data['sbg:includeInPorts'] = data['sbg:includeInPorts'] || true;

                    outputs.push(Terminal.getInstance({
                        model: data,
                        parent: this,
                        canvas: canvas,
                        pipeline: this.Pipeline,
                        pipelineWrap: this.parent
                    }));
                }

            },

            _calculateTerminalAngles: function(count, offset, r, isInput) {

                var toRadians,
                    floor = Math.floor,
                    sin = Math.sin,
                    cos = Math.cos,
                    range = 120,
                    step = range / count,
                    halfStep = step / 2,
                    coords = [],
                    i, stepDeg, deg, rad;

                toRadians = function(deg) {
                    return deg * Math.PI / 180;
                };

                if (isInput) {
                    while (count--) {

                        stepDeg = count * step;
                        deg = stepDeg + halfStep + offset;
                        rad = toRadians(deg);

                        coords.push({
                            x: floor(cos(rad) * (r)),
                            y: floor(sin(rad) * (r))
                        });
                    }
                } else {
                    for (i = 0; i < count; i++) {

                        stepDeg = i * step;
                        deg = stepDeg + halfStep + offset;
                        rad = toRadians(deg);

                        coords.push({
                            x: floor(cos(rad) * (r)),
                            y: floor(sin(rad) * (r))
                        });
                    }
                }

                return coords;
            },


            _attachEvents: function() {

                var _self = this,
                    node = this.el,
                    borders = this.circle,
                    outerBorder = this._outerBorder;

                borders.mouseover(function() {

                    node.toFront();

                    _self.glow = outerBorder.glow({
                        width: 15,
                        filled: true,
                        opacity: 0.3
                    }).attr({
                        stroke: '#9b9b9b'
                    });

                    _self.showTerminalNames();

                });

                node.mouseout(function() {

                    if (typeof _self.glow !== 'undefined') {
                        _self.glow.remove();
                    }

                    _self.hideTerminalNames();

                });

                borders.click(function(e) {

                    var dragged = this.dragged;

                    if (typeof dragged !== 'undefined' && !dragged) {

                        if (!e.ctrlKey && !e.metaKey) {
                            this.Pipeline.Event.trigger('node:deselect');
                        }

                        if (this.Pipeline.editMode) {
                            this._select();
                        } else {
                            this._showInfo();
                        }

                    }

                    this.dragged = false;
                }, this);

                borders.drag(this.onMove, this.onMoveStart, this.onMoveEnd,
                    this, this, this);

                this.label.dblclick(function(e) {
                    e.preventDefault();

                    this._initNameChanging();

                }, this);

            },

            onMoveStart: function(x, y, event, startCoords) {

                var parent = this.parent,
                    parentCoords = parent.node.getCTM(),
                    scale = parent.getScale();

                startCoords.x -= parentCoords.e;
                startCoords.y -= parentCoords.f;

                // if canvas iz zoomed ( scaled ) you also need to adjust starting coordinates according to zoom level
                startCoords.x = startCoords.x / scale.x;
                startCoords.y = startCoords.y / scale.y;

            },

            onMove: function(dx, dy, x, y, event, start) {

                var parent = this.parent,
                    node = this.el,
                    scale = parent.getScale(),
                    old = node.getTranslation();

                // divide movement proportionally
                // so you get equal movement in zoom state
                // if scale is 1 it wont matter
                dx = dx / scale.x;
                dy = dy / scale.y;

                node.translate(start.x + dx, start.y + dy);

                this.redrawConnections();

                this.dragged = true;

                if (this.selected) {
                    this.Pipeline.moveSelectedNodes((start.x + dx) - old.x, ( start.y + dy) - old.y, this.model.id);
                }

                this.Pipeline.Event.trigger('scrollbars:draw');
                this.Pipeline.Event.trigger('pipeline:change');
            },

            onMoveEnd: function() {

                var position = this.el.getTranslation(),
                    model = this.model;

                if (model.x !== position.x || model.y !== position.y) {
                    model.x = position.x;
                    model.y = position.y;

                    if (this.dragged) {
                        this.Pipeline.Event.trigger('pipeline:change', 'display');
                    }
                }
            },

            /**
             * Get current node translation.
             *
             * @returns {x:number, y:number}
             */
            getTranslation: function() {
                return this.el.getTranslation();
            },

            /**
             * Set translation coordinates to provided (x, y).
             *
             * @param {number} x
             * @param {number} y
             */
            translate: function(x, y) {
                this.el.setTranslation(x, y);
            },

            /**
             * Add provided (x, y) to current translation corrdinates.
             *
             * @param {number} dx
             * @param {number} dy
             */
            addTranslation: function(dx, dy) {
                var translate = this.el.getTranslation();
                //var parent = this.parent,
                //    parentCoords = parent.node.getCTM(),
                //    scale = parent.getScale();

                var x = translate.x + dx,
                    y = translate.y + dy;

                this.translate(x, y);

                this.redrawConnections();

                this.Pipeline.Event.trigger('scrollbars:draw');

            },

            getTerminalById: function(id, type) {

                var terminal;

                terminal = _.find(this[type + 's'], function(term) {
                    var terId = term.model.id;
                    return terId === id;
                });

                return terminal;
            },

            showTerminalNames: function() {
                var inputs = this.inputs,
                    outputs = this.outputs;

                // show input and output terminals' labels
                _.forEach(inputs, function(input) {
                    input.showTerminalName();
                });
                _.forEach(outputs, function(output) {
                    output.showTerminalName();
                });
            },

            hideTerminalNames: function() {
                var inputs = this.inputs,
                    outputs = this.outputs;

                // hide input and output terminals' labels
                _.forEach(inputs, function(input) {
                    input.hideTerminalName();
                });
                _.forEach(outputs, function(output) {
                    output.hideTerminalName();
                });

            },

            redrawConnections: function() {
                _.each(this.connections, function(connection) {
                    if (connection) {
                        connection.draw();
                    }
                });

            },

            addConnection: function(connection) {
                this.connections[connection.id] = connection;

                if (this.selected) {
                    connection.getEl().glow();
                }

                // recalculate file types only for regular input node
                //            if (this.model.type.indexOf('input/') !== -1) {
                //                this._recalculateFileTypes();
                //            }
            },

            removeConnection: function(connection) {
                if (this.connections[connection.id]) {

                    this.connections[connection.id] = null;

                    delete this.connections[connection.id];

                    this.Pipeline.removeConnection(connection);
                }

                // recalculate file types only for input nodes
                //            if (this.model.type.indexOf('input/') !== -1) {
                //                this._recalculateFileTypes();
                //            }
            },

            _updateNode: function() {

                var updateButton = this.updateNodeButton;

                if (updateButton.isDisabled()) {
                    Notification.primary('Node is updating. Please, wait...');
                    return;
                }

                // call update from Pipeline Instance
                this.Pipeline.updateNodeSchema(this.model.id, this.model.x, this.model.y)
                    .then(function() {
                        updateButton.disable(false);
                    });

                updateButton.disable(true);
            },

            deselectAvailableTerminals: function() {

                _.each(this.inputs, function(terminal) {
                    terminal.setDefaultState();
                });

                _.each(this.outputs, function(terminal) {
                    terminal.setDefaultState();
                });

            },

            _showButtons: function() {
                var _self = this,
                    bbox,
                    nodeRadius = this.constraints.radius,
                    buttonDistance = typeof this.buttons.distance !== 'undefined' ? -this.buttons.distance - nodeRadius - this.buttons.radius : -nodeRadius * 1.5;

                var buttonCoords = [+32, -32, 0];

                if (!this.isOutdated) {
                    buttonCoords = [+16, -16, 0];
                }

                if (!this.infoButton && !this.removeNodeButton && !this.updateNodeButton) {

                    this.buttons.rename.image.url = 'images/' + this.buttons.rename.image.name;

                    this.infoButton = this.canvas.button({
                        fill: this.buttons.info.fill,
                        x: buttonCoords[0],
                        y: buttonDistance,
                        radius: this.buttons.radius,
                        border: this.buttons.border,
                        image: {
                            url: '/editors/app/' + 'images/' + this.buttons.info.image.name,
                            width: 14,
                            height: 14
                        }
                    }, {
                        onClick: this._showInfo,
                        scope: this
                    });

                    this.removeNodeButton = this.canvas.button({
                        fill: this.buttons.delete.fill,
                        x: buttonCoords[1],
                        y: buttonDistance,
                        radius: this.buttons.radius,
                        border: this.buttons.border,
                        image: {
                            url: '/editors/app/' + 'images/' + this.buttons.delete.image.name,
                            width: 14,
                            height: 14
                        }
                    }, {
                        onClick: this._removeNodeButtonClick,
                        scope: this
                    });

                    if (this.isOutdated) {

                        this.updateNodeButton = this.canvas.button({
                            fill: this.buttons.update.fill,
                            x: buttonCoords[2],
                            y: buttonDistance,
                            radius: this.buttons.radius,
                            border: this.buttons.border,
                            image: {
                                url: '/editors/app/' + 'images/' + this.buttons.update.image.name,
                                width: 14,
                                height: 14
                            }
                        }, {
                            onClick: this._updateNode,
                            scope: this
                        });

                    }


                    bbox = this.label.getBBox();
                    this.editLabelButton = this.canvas.button({
                        fill: this.buttons.rename.fill,
                        x: bbox.x + bbox.width + 20,
                        y: bbox.y + 8,
                        radius: 10,
                        border: this.buttons.border,
                        image: {
                            url: '/editors/app/' + 'images/' + this.buttons.rename.image.name,
                            width: 13,
                            height: 13
                        },

                        borderFill: 'transparent',
                        borderStroke: 'transparent'
                    }, {
                        onClick: this._initNameChanging,
                        scope: this
                    });

                    this.el.push(this.editLabelButton.getEl());


                    _self.el
                        .push(_self.infoButton.getEl())
                        .push(_self.removeNodeButton.getEl());

                    if (this.isOutdated) {
                        _self.el.push(_self.updateNodeButton.getEl());
                    }

                }

            },

            _destroyButtons: function() {

                if (this.infoButton) {
                    this.infoButton.remove();
                    this.infoButton = null;
                }

                if (this.removeNodeButton) {
                    this.removeNodeButton.remove();
                    this.removeNodeButton = null;
                }

                if (this.updateNodeButton) {
                    this.updateNodeButton.remove();
                    this.updateNodeButton = null;
                }

                if (this.editLabelButton) {
                    this.editLabelButton.remove();
                    this.editLabelButton = null;
                }

            },

            _removeNodeButtonClick: function() {
                this.Pipeline.Event.trigger('node:deselect');
                this.removeNode();
            },

            /**
             * Lunch modal box with node description
             *
             * @private
             */
            _showInfo: function() {
                var schema = false;

                if (Common.checkSystem(this.model)) {
                    schema = this.model.inputs[0] || this.model.outputs[0];
                }

                $rootScope.$broadcast('node:info', this.model, schema);
            },

            /**
             * Triggered only on system Nodes
             *
             * @private
             */
            _initNameChanging: function() {

                var nodeName = this.model.label;

                var opts = {
                    label: nodeName,
                    isSystem: Common.checkSystem(this.model)
                };

                $rootScope.$broadcast('node:label:edit', opts, this._changeNodeLabel, this);
            },

            _changeNodeLabel: function(label) {

                var nodeType = this.inputs.length > 0 ? 'inputs' : 'outputs';

                this.model.label = label;

                try {
                    this.model[nodeType][0].label = label;
                }
                catch (ex) {
                    console.log('"node > ', nodeType, ' > first element" does not exist');
                    console.log(ex.stacktrace);
                }

                this.label.attr('text', label);
                this._destroyButtons();

                if (this.selected) {
                    this._showButtons();
                }

                this.Pipeline.Event.trigger('pipeline:change');
            },

            _changeNodeId: function(id) {

                var ter, old, oldId,
                    isInput = this.inputs.length === 0;

                this.model.label = id;

                if (Common._checkSystem(this.model)) {

                    // Genereta id first (Check for id conflict)
                    id = Common.generateNodeId({name: name}, this.Pipeline.nodes);
                    this.Pipeline.model.schemas[this.model.id].name = id;

                    //TODO: Refactor this to use one function
                    if (isInput) {
                        ter = this.outputs[0];

                        old = _.find(this.Pipeline.model.schemas[this.model.id].outputs, function(inp) {
                            return inp.id === ter.model.id;
                        });

                        oldId = ter.model.id;

                        old.label = old.name = id;
                        old.id = id;

                        this.model.outputs.push(old);

                        _.remove(this.model.outputs, function(inp) {
                            return inp.id === ter.model.id;
                        });

                        this.Pipeline.model.schemas[id] = this.Pipeline.model.schemas[oldId];

                        this.Pipeline.model.schemas[id].outputs.pop();
                        this.Pipeline.model.schemas[id].outputs.push(old);

                        _.remove(this.Pipeline.model.schemas[id].outputs, function(inp) {
                            return inp.id === oldId;
                        });

                        ter.model.label = ter.model.id = id;

                        ter.changeTerminalName(id);

                        this.model.outputs[0] = ter.model;

                    } else {

                        ter = this.inputs[0];

                        old = _.find(this.Pipeline.model.schemas[this.model.id].inputs, function(inp) {
                            return inp.id === ter.model.id;
                        });

                        oldId = ter.model.id;

                        old.label = old.name = id;
                        old.id = id;

                        this.model.inputs.push(old);

                        _.remove(this.model.inputs, function(inp) {
                            return inp.id === ter.model.id;
                        });

                        this.Pipeline.model.schemas[id] = this.Pipeline.model.schemas[oldId];

                        this.Pipeline.model.schemas[id].inputs.pop();
                        this.Pipeline.model.schemas[id].inputs.push(old);

                        _.remove(this.Pipeline.model.schemas[id].inputs, function(inp) {
                            return inp.id === oldId;
                        });

                        ter.model.label = ter.model.id = id;

                        ter.changeTerminalName(id);

                        this.model.inputs[0] = ter.model;

                    }

                    this.id = id;
                    this.model.id = id;
                    this.model.softwareDescription.name = id;

                    this.Pipeline.model.schemas[id].id = this.model.id;

                    delete this.Pipeline.model.schemas[oldId];

                    this.Pipeline.nodes[id] = this.Pipeline.nodes[oldId];
                    delete this.Pipeline.nodes[oldId];

                    if (this.Pipeline.model.display.nodes[oldId]) {
                        delete this.Pipeline.model.display.nodes[oldId];
                    }

                    // Delete unwanted props from schema
                    // when id changes it picks up whole model with x and y coordinates which we dont wont
                    if (isInput) {
                        delete this.Pipeline.model.schemas[this.model.id].outputs[0].x;
                        delete this.Pipeline.model.schemas[this.model.id].outputs[0].y;
                        delete this.Pipeline.model.schemas[this.model.id].outputs[0].input;
                    } else {
                        delete this.Pipeline.model.schemas[this.model.id].inputs[0].x;
                        delete this.Pipeline.model.schemas[this.model.id].inputs[0].y;
                        delete this.Pipeline.model.schemas[this.model.id].inputs[0].input;
                    }

                    _.each(this.connections, function(c) {
                        if (isInput) {
                            c.model.output_name = id;
                            c.model.start_node = id;
                        } else {
                            c.model.input_name = id;
                            c.model.end_node = id;
                        }
                    });

                    if (id.charAt(0) === '#') {
                        id = id.slice(1);
                    }

                }

                this.label.attr('text', id);
                this._destroyButtons();

                if (this.selected) {
                    this._showButtons();
                }

            },

            _select: function() {

                if (!this.Pipeline.editMode) {
                    return;
                }

                this._showButtons();

                // Show selected state
                this._innerBorder.attr({
                    fill: this.constraints.selected.fill
                });

                this.selected = true;

                this.Pipeline.Event.trigger('node:select', this);

                _.forEach(this.connections, function(connection) {
                    connection.getEl().glow();
                });
            },

            _deselect: function() {
                this._destroyButtons();

                // Show default state
                this._innerBorder.attr({
                    fill: this.isOutdated ? this.constraints.outdated.fill : this.constraints.fill
                });

                this.selected = false;

                _.forEach(this.connections, function(connection) {
                    connection.connection.unGlow();
                });

            },

            _removeValues: function() {
                var id = this.model.id;

                _.forEach(this.Pipeline.values, function(val, nodeId, obj) {
                    if (nodeId === id) {
                        obj[nodeId] = null;
                        delete obj[nodeId];
                    }
                });

                _.forEach(this.Pipeline.exposed, function(val, ni, obj) {
                    var nodeId = ni.split(Const.exposedSeparator)[0];

                    if (nodeId === id) {
                        obj[ni] = null;
                        delete obj[ni];
                    }
                });
            },

            /**
             * Set outdated state
             *
             * @param isOutdated
             */
            setOutdated: function(isOutdated) {

                if (typeof isOutdated !== 'boolean') {
                    console.error('Wrong parametar passed, expexted boolean, got: ', typeof isOutdated);
                    return false;
                }

                this.isOutdated = isOutdated;

                this._innerBorder.attr({
                    fill: this.isOutdated ? this.constraints.outdated.fill : this.constraints.fill
                });
            },

            removeNode: function() {

                var _self = this;

                if (this.destroyed) {
                    return;
                } else {
                    this.destroyed = true;
                }

                this._destroyButtons();

                _.each(this.connections, function(connection) {
                    if (connection) {
                        connection.destroyConnection(_self.id);
                    }
                });

                _.each(this.inputs, function(t) {
                    t.destroy();
                });

                _.each(this.outputs, function(t) {
                    t.destroy();
                });

                this.connections = {};

                if (typeof this.glow !== 'undefined') {
                    this.glow.remove();
                }

                this._removeValues();

                this.destroy();
            },

            destroy: function() {

                this.circle.unbindMouse().unhover().unclick().unkeyup();
                // remove element which has events attached to it, safety purposes :)
                this.circle.remove();

                this.el.remove();

                this.Pipeline.Event.trigger('node:destroy', this.model);

            }
        };

        return {
            getInstance: function(options) {
                return new Node(options);
            }
        };

    }]);
