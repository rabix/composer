/**
 * Created by filip on 8.10.14..
 */

'use strict';

angular.module('registryApp.dyole')
    .service('pipeline', ['event', 'node', 'connection', '$rootScope', 'systemNodeModel', 'FormaterD2', 'Const', 'common', 'lodash', 'SchemaValidator', 'Notification', 'App', function(Event, Node, Connection, $rootScope, systemNodeModel, Formater, Const, Common, _, Validator, Notification, App) {
        /** Temporary hack!! **/
        var initWidth;

        /**
         * Pipeline constructor
         *
         * @param options
         * @constructor
         */
        var Pipeline = function(options) {

            this.model = options.model;
            this.$parent = options.$parent;

            if (this.model.steps && this.model.steps.length !== 0) {
                this.model = Formater.toPipelineSchema(this.model);
            }

            //this.model.schemas = this.model.schemas || {};
            this.model.display = this.model.display || {};

            this.model.hints = this.model.hints || [];
            this.model.requireSBGMetadata = this.model.requireSBGMetadata || false;

            this.nodes = {};
            this.connections = {};

            /**
             * Values for params and exposed params holders
             * @type {{}}
             */
            this.exposed = this.model.exposed || {};
            this.values = this.model.values || {};
            this.suggestedValues = this.model.suggestedValues || {};

            /**
             * Clone event object for every pipeline
             */
            this.Event = angular.copy(Event);

            /**
             * Callback to get app
             */
            this.getApp = options.getApp;

            /**
             * Pipeline in preview?
             * @type {.scope.editMode|*|Pipeline.editMode|$scope.view.editMode}
             */
            this.editMode = options.editMode;

            /**
             * Cache selected nodes
             *
             * @type {Array}
             */
            this.selectedNodes = [];

            // temporarily holding references to the terminals
            // needed for connection to render
            this.tempConnectionRefs = null;

            // flag for temporary connection
            this.tempConnectionActive = false;

            this._fixDisplay();
            /**
             * Save ref to the current canvas scale
             * @type {*|number}
             */
            this.currentScale = this.model.display.canvas.zoom || 1.0;

            this._initCanvas();
            this._attachEvents();
            this._generateNodes();
            this._generateConnections();

            this._drawScrollbars();

            this._checkOutdated();
        };

        Pipeline.prototype = {

            constraints: {
                dropArea: {
                    width: 140
                },
                zoomOutCap: 0.6,
                zoomInCap: 1.2
            },

            /**
             * Attach necessary listeners
             *
             * @private
             */
            _attachEvents: function() {
                var _self = this,
                    $canvasArea = this.$parent;

                this.Event.subscribe('temp:connection:state', function(state) {
                    _self.tempConnectionActive = state;
                });

                this.Event.subscribe('scrollbars:draw', function() {
                    _self._drawScrollbars();
                });

                /**
                 * @param type {string}
                 */
                this.Event.subscribe('pipeline:change', function(isDisplay) {
                    $rootScope.$broadcast('pipeline:change', !!isDisplay);
                });

                this.Event.subscribe('node:add', function(model) {

                    var node = Node.getInstance({
                        pipeline: _self,
                        model: model,
                        canvas: _self.canvas,
                        pipelineWrap: _self.pipelineWrap
                    });

                    _self.nodes[model.id] = node;

                    _self.pipelineWrap.push(node.render().el);

                    _self.Event.trigger('pipeline:change');

                });

                this.Event.subscribe('node:deselect', function(stopPropagaion) {

                    _.forEach(_self.selectedNodes, function(node) {
                        if (node.selected) {
                            node._deselect();
                        }
                    });

                    _self.selectedNodes.splice(0, _self.selectedNodes.length);

                    if (!stopPropagaion) {
                        _self.Event.trigger('controller:node:deselect');
                    }

                });

                this.Event.subscribe('node:destroy', function(model) {

                    _self.nodes[model.id] = null;

                    delete _self.nodes[model.id];

                    //@fixme possible hack to fix the workflow flush problem
                    if (_self.model) {
                        _self.model.schemas[model.id] = null;
                        delete _self.model.schemas[model.id];
                    }

                    _.remove(_self.nodes, function(n) {
                        return n.model.id === model.id;
                    });

                    _self.Event.trigger('pipeline:change');
                    _self.Event.trigger('controller:node:destroy');
                });

                this.Event.subscribe('node:select', function(node) {
                    var model = node.model;

                    //if (!model.softwareDescription || model.softwareDescription.type !== 'output') {
                    if (!model.softwareDescription) {
                        if (_self.selectedNodes.length === 0) {
                            _self.Event.trigger('controller:node:select', {}, model, _self.exposed, _self.values, _self.suggestedValues);
                        }
                    }

                    _self.selectedNodes.push(node);

                });

                this.Event.subscribe('connection:create', function(endTerminal, startTerminal) {
                    var end = endTerminal.model.input ? endTerminal :
                            startTerminal,
                        start = endTerminal.model.input ? startTerminal :
                            endTerminal;

                    _self.tempConnectionRefs = {
                        end: end,
                        start: start
                    };

                    // connection id has to be set here because of dynamic connection creation
                    var model = {
                        id: _.random(100000, 999999) + '', // it has to be a string
                        start_node: start.parent.model.id,
                        end_node: end.parent.model.id,
                        input_name: end.model.id,
                        output_name: start.model.id
                    };

                    _self.createConnection(model);

                });

                this.Event.subscribe('connection:destroyed', function(model) {
                    var endNode = _self.nodes[model.end_node],
                        startNode = _self.nodes[model.start_node];

                    if (startNode && Common.checkSystem(startNode.model) && Object.keys(startNode.connections).length === 0) {
                        startNode.removeNode();
                    }

                    if (endNode && Common.checkSystem(endNode.model) && Object.keys(endNode.connections).length === 0) {
                        endNode.removeNode();
                    }
                });

                /**
                 * Attach listener for mouse scroll on canvas element.
                 * Using mouse scroll + CTRL/CMD to zoom in/out.
                 * wheel event is supported by all browsers
                 */
                $canvasArea[0].addEventListener('wheel', function(e) {

                    if (e.ctrlKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (e.deltaY > 0) {
                            _self.zoomOut();
                        }
                        else if (e.deltaY < 0) {
                            _self.zoomIn();
                        }
                    }
                });

                $canvasArea.mousemove(function(e) {
                    _.each(_self.nodes, function(node) {

                        _.each(node.inputs, function(i) {
                            e.preventDefault();
                            // e.stopPropagation();

                            if (i.mousedown) {
                                if (!i.tempConnection) {
                                    i.drawConnection(e);
                                } else {
                                    i.redrawConnection(e);
                                }
                            }
                        });

                        _.each(node.outputs, function(o) {
                            e.preventDefault();
                            // e.stopPropagation();

                            if (o.mousedown) {
                                if (!o.tempConnection) {
                                    o.drawConnection(e);
                                } else {
                                    o.redrawConnection(e);
                                }
                            }
                        });

                    });
                });

                /**
                 * Attach listener for mouse scroll on canvas element.
                 * Using mouse scroll + CTRL/CMD to zoom in/out.
                 * wheel event is supported by all browsers
                 */
                $canvasArea[0].addEventListener('wheel', function(e) {

                    if (e.ctrlKey) {

                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (e.deltaY > 0) {
                            _self.zoomOut();
                        }
                        else if (e.deltaY < 0) {
                            _self.zoomIn();
                        }
                    }
                });

                $('body').on('mouseup', function() {

                    _.each(_self.nodes, function(node) {

                        _.each(node.inputs, function(i) {
                            i.parent.deselectAvailableTerminals();
                            i._removeTempConnection();

                            i.onMouseUpCallback();

                            i.mouseoverTerminal = null;
                            i.mousedown = false;
                        });

                        _.each(node.outputs, function(o) {
                            o.parent.deselectAvailableTerminals();
                            o._removeTempConnection();

                            o.onMouseUpCallback();

                            o.mouseoverTerminal = null;
                            o.mousedown = false;
                        });

                    });
                });
            },

            _fixDisplay: function() {

                if (typeof this.model.display === 'undefined') {
                    this.model.display = {};
                }

                if (typeof this.model.display.canvas === 'undefined') {
                    this.model.display.canvas = {
                        x: 0,
                        y: 0,
                        zoom: 1
                    };
                }

                if (typeof this.model.display.nodes === 'undefined') {
                    this.model.display.nodes = {};
                }

            },

            /**
             * Initialize canvas element
             *
             * @private
             */
            _initCanvas: function() {
                var width = 600;
                var height = 600;
                var $parent = this.$parent;
                var $parentDim = {
                        width: $parent[0].offsetWidth - 10,
                        height: $parent[0].offsetHeight || $parent[0].parentNode.offsetHeight
                    };

                // in case the view has not initialized yet, width and height would be -10
                width = $parentDim.width >= 0 ? $parentDim.width : width;
                height = $parentDim.height >= 0 ? $parentDim.height : height;

                if (height > 0) {
                    height -= 10;
                }

                this.canvas = new Raphael(this.$parent[0], width, height);
                this.pipelineWrap = this.canvas.group();
                initWidth = width;

                this._initCanvasPosition();
                this._initRect(this.canvas, width, height);
                this._initCanvasMove();
            },

            /**
             * Move canvas in last saved position
             *
             * @private
             */
            _initCanvasPosition: function() {
                this._move(this.model.display.canvas);
            },

            /**
             * Init Rect to watch for dragging canvas
             *
             * @param canvas
             * @param width
             * @param height
             * @private
             */
            _initRect: function(canvas, width, height) {

                this.rect = canvas.rect(0, 0, width, height);
                this.rect.dragged = false;

                this.rect.attr({
                    stroke: 'none',
                    fill: '#fff',
                    opacity: '0'
                });

            },

            /**
             * Initialize zooming
             *
             * @param step
             * @private
             */
            _initZoomLevel: function(step) {

                this.getEl().scale(step, step);

                this._drawScrollbars();

            },

            /**
             * Move canvas
             *
             * @param position
             * @private
             */
            _move: function(position) {
                this.getEl().translate(position.x, position.y);
            },

            /**
             * Initialize canvas moving
             *
             * @private
             */
            _initCanvasMove: function() {

                var _self = this,
                    canvas = this.getEl(),
                    currentZoomLevel = canvas.getScale(),
                    start, move, end, startCoords;

                start = function startDragging(x, y, event) {

                    if (event.which !== 1) {
                        return;
                    }

                    startCoords = canvas.getTranslation();

                    startCoords.x = startCoords.x * currentZoomLevel.x;
                    startCoords.y = startCoords.y * currentZoomLevel.y;
                };

                move = function onMove(x, y, dx, dy, event) {

                    if (event.which !== 1) {
                        return;
                    }

                    var translation = startCoords,
                        canvasEmpty = Object.keys(_self.nodes).length === 0;

                    if (!canvasEmpty) {

                        canvas.translate((translation.x + x) / currentZoomLevel.x, (
                            translation.y + y) / currentZoomLevel.y);

                        _self.rect.dragged = true;
                        _self._drawScrollbars();
                    }

                };

                end = function endDragging() {

                    // clone translation object
                    var can, canvasTranslation = angular.copy(canvas.getTranslation());

                    // add zoom level
                    canvasTranslation.zoom = currentZoomLevel.x;

                    // set it to the pipeline model
                    can = _self.model.display.canvas;

                    can.x = canvasTranslation.x;
                    can.y = canvasTranslation.y;

                    if (_self.rect.dragged) {
                        //                    globals.vents.trigger('pipeline:change', 'display');
                    }

                    startCoords = {
                        x: 0,
                        y: 0
                    };

                    _self.Event.trigger('pipeline:change', 'display');
                };

                this.rect.drag(move, start, end);
                this.rect.click(function() {
                    if (!_self.rect.dragged) {
                        _self.Event.trigger('node:deselect');
                    }

                    _self.rect.dragged = false;
                });

                this.rect.mouseover(function() {
                    _self.Event.trigger('remove:wire');
                });

            },

            /**
             * Generate canvas nodes from pipeline model
             *
             * @private
             */
            _generateNodes: function() {

                var _self = this;

                _.each(this.model.nodes, function(nodeModel) {

                    var nodeId = nodeModel.id;
                    // schema is not merged because nodes is a copy of schema with modified inputs and outputs for displaying on canvas
                    // schema is only used for tool execution
                    var model = _.extend(nodeModel, _self.model.display.nodes[nodeId]);

                    _self.nodes[nodeId] = Node.getInstance({
                        pipeline: _self,
                        model: model,
                        canvas: _self.canvas,
                        pipelineWrap: _self.pipelineWrap
                    });
                });

                _.each(this.nodes, function(node) {
                    _self.pipelineWrap.push(node.render().el);
                });

                this.pipelineWrap.translate(this.model.display.canvas.x, this.model.display.canvas.y);

                this.rect.toBack();
            },

            /**
             * Generate connections based on relations from model
             *
             * @private
             */
            _generateConnections: function() {
                var _self = this;

                _.each(this.model.relations, function(connection) {

                    _self.createConnectionFromModel(connection);

                });
            },

            /**
             * Create single connection
             * Creating from pipeline model
             *
             * @param connection
             * @private
             */
            createConnectionFromModel: function(connection) {
                var _self = this;
                var input = _self.nodes[connection.start_node].getTerminalById(
                    connection.output_name, 'output');
                var output = _self.nodes[connection.end_node].getTerminalById(
                    connection.input_name, 'input');

                _self.connections[connection.id] = Connection.getInstance({
                    model: connection,
                    canvas: _self.canvas,
                    parent: _self.pipelineWrap,
                    nodes: _self.nodes,
                    pipeline: _self,
                    input: input,
                    output: output,
                    element: _self.$parent
                });

                _self.nodes[connection.start_node].addConnection(_self.connections[
                    connection.id]);
                _self.nodes[connection.end_node].addConnection(_self.connections[
                    connection.id]);
            },

            moveSelectedNodes: function(dx, dy, except) {

                _.each(this.selectedNodes, function(node) {
                    if (node.model.id !== except) {
                        node.addTranslation(dx, dy);
                    }
                });

            },

            /**
             * Creates inputs and outputs
             * Generates models for system nodes
             *
             * @param isInput
             * @param x
             * @param y
             * @param terminal
             * @private
             */
            _createSystemNode: function(isInput, x, y, terminal) {
                var model = angular.copy(systemNodeModel),
                    terminalId, terId,
                    internalType = isInput ? 'outputs' : 'inputs',
                    type = isInput ? 'input' : 'output';


                var newId = terminal.model.id[0] === '#' ? terminal.model.id.slice(1) : terminal.model.id;

                var descriptions = {
                    input: '###*Input*' + '\n' + 'Downloads input files to local cluster for further processing.',
                    output: '###*Output*' + '\n' + 'Uploads resulting files from processing cluster to user storage.'
                };

                terId = Common.generateNodeId({label: newId}, this.nodes);

                model.label = terId.slice(1);
                model.description = descriptions[type];
                model['sbg:createdBy'] = 'SBG';
                model.softwareDescription.label = model.label;
                model.softwareDescription.type = type;
                model[internalType].push({
                    'label': terId.slice(1),
                    'id': terId,
                    'type': terminal.model.type
                });

                if (terminal.model['sbg:includeInPorts']) {
                    model[internalType][0]['sbg:includeInPorts'] = terminal.model['sbg:includeInPorts'];
                }

                terminalId = terId;

                var _id = Common.generateNodeId(model, this.nodes);

                model.id = _id;

                this.addNode(model, x, y, true);
                this._connectSystemNode(terminal, _id, isInput, terminalId);
            },

            /**
             * Mark drop areas for input/output creation
             *
             * @param isInput
             * @private
             */
            _markCreateArea: function(isInput) {

                var rect,
                    areaWidth = this.constraints.dropArea.width;

                if (isInput) {
                    rect = this.canvas.rect(0, 0, areaWidth, this.canvas.height);
                } else {
                    rect = this.canvas.rect(this.canvas.width - areaWidth, 0,
                        areaWidth, this.canvas.height);
                }

                rect.attr({
                    stroke: 'none',
                    fill: '#f0ad4e',
                    opacity: '0.3'
                });

                rect.toBack().animate({
                    opacity: 0
                }, 600, function() {
                    this.animate({
                        opacity: 0.3
                    }, 600, function() {
                        this.animate({
                            opacity: 0
                        }, 600, function() {
                            this.animate({
                                opacity: 0.3
                            }, 600, function() {

                            });
                        });
                    });

                });

                rect.isInput = isInput;

                this.dropZoneRect = rect;

            },

            /**
             * Draw canvas position indicators - scrollbars
             *
             * @private
             */
            _drawScrollbars: function() {

                var canvas = this.getEl(),
                    canvasBox = canvas.node.getBBox(),
                    color = '#B6B6B6',
                    size = 8,
                    doubleSize = size * 2,
                    edgesRadius = size / 3, // rounding edges radius for both bars (Vertical / Horizontal Radius)
                    hBar, vBar, canvasTransform, surface, surfaceDimensions,
                    surfaceWidth, surfaceHeight,
                    hX, hY, hW, vX, vY, vH, ratioL, ratioR, ratioT, ratioB,
                    canvasTranslation;

                //            if (!canvasBox) {
                //                canvas.setTransform(new matrix.translate(0, 0));
                //                return;
                //            }

                hBar = this.horizontalBar;
                vBar = this.verticalBar;
                canvasTransform = canvas.node.getCTM(); // || matrix.identity;
                surface = this.canvas;
                surfaceDimensions = {
                    width: surface.width,
                    height: surface.height
                };

                surfaceWidth = surfaceDimensions.width;
                surfaceHeight = surfaceDimensions.height;
                canvasBox.l = canvasBox.x + canvasTransform.e;
                canvasBox.r = canvasBox.l + (canvasBox.width * canvasTransform.a);
                canvasBox.t = canvasBox.y + canvasTransform.f;
                canvasBox.b = canvasBox.t + (canvasBox.height * canvasTransform
                        .d);

                if (hBar) {
                    hBar.remove();
                    this.horizontalBar = null;
                }
                if (vBar) {
                    vBar.remove();
                    this.verticalBar = null;
                }

                if (canvasBox.l < 0 || canvasBox.r > surfaceWidth) {

                    ratioL = ratioR = 1;

                    if (canvasBox.l < 0) {
                        ratioL = surfaceWidth / (surfaceWidth - canvasBox.l);
                    }

                    if (canvasBox.r > surfaceWidth) {
                        ratioR = surfaceWidth / canvasBox.r;
                    }

                    hX = (canvasBox.l < 0 ? surfaceWidth - surfaceWidth * ratioL :
                            0) + size / 2;
                    hY = surfaceHeight - size * 1.5;
                    hW = surfaceWidth * (ratioR * ratioL) - doubleSize;

                    if (hX > surfaceWidth - doubleSize * 2) {
                        hX = surfaceWidth - doubleSize * 2;
                    }
                    if (hW < doubleSize) {
                        hW = doubleSize;
                    }

                    hBar = this.canvas.rect(hX, hY, hW, size, edgesRadius).attr({
                        fill: color,
                        stroke: 'none'
                    });

                    hBar.toFront();
                    this.horizontalBar = hBar;
                }

                if (canvasBox.t < 0 || canvasBox.b > surfaceHeight) {

                    ratioT = ratioB = 1;

                    if (canvasBox.t < 0) {
                        ratioT = surfaceHeight / (surfaceHeight - canvasBox.t);
                    }
                    if (canvasBox.b > surfaceHeight) {
                        ratioB = surfaceHeight / canvasBox.b;
                    }

                    vX = surfaceWidth - size * 1.5;
                    vY = (canvasBox.t < 0 ? surfaceHeight * (1 - ratioT) : 0) +
                        size / 2;
                    vH = surfaceHeight * (ratioB * ratioT) - doubleSize;

                    if (vY > surfaceHeight - doubleSize * 2) {
                        vY = surfaceHeight - doubleSize * 2;
                    }
                    if (vH < doubleSize) {
                        vH = doubleSize;
                    }

                    vBar = this.canvas.rect(vX, vY, size, vH, edgesRadius).attr({
                        fill: color,
                        stroke: 'none'
                    });
                    vBar.toFront();
                    this.verticalBar = vBar;
                }
            },

            /**
             *  Transform node model for easier use
             *
             * @param nodeModel
             * @returns {*}
             * @private
             */
            _transformModel: function(nodeModel) {

                var model = nodeModel.json || nodeModel;

                _.forEach(model.inputs.properties, function(input, name) {
                    input.name = name;
                    input.id = input.id || name;
                });

                _.forEach(model.outputs.properties, function(output, name) {
                    output.name = name;
                    output.id = output.id || name;

                });

                return model;

            },

            /**
             * Transform workflow model
             *
             * @param nodeModel
             * @returns {*}
             * @private
             */
            _transformWorkflowModel: function(nodeModel) {
                return nodeModel.json;
            },

            /**
             * Get element offset
             *
             * @param element
             * @returns {{top: number, left: number}}
             * @private
             */
            _getOffset: function(element) {

                var bodyRect = document.body.getBoundingClientRect();
                var elemRect = element.getBoundingClientRect();
                var top = elemRect.top - bodyRect.top;
                var left = elemRect.left - bodyRect.left;

                return {
                    top: top,
                    left: left
                };
            },

            /**
             * Get connections from pipeline model
             * Used when generating pipeline json
             *
             * @returns {*}
             * @private
             */
            _getConnections: function() {
                return _.pluck(this.connections, 'model');
            },

            /**
             * Get connections from pipeline model
             * Used when generating pipeline json
             *
             * @returns {*}
             * @private
             */
            getConnections: function() {
                return this._getConnections();
            },

            /**
             * Get nodes from pipeline model
             * Used when generating pipeline json
             *
             * @returns {*}
             * @private
             */
            _getNodes: function() {
                return angular.copy(_.pluck(this.nodes, 'model'));
            },

            /**
             * Get node instance by id
             *
             * @param nodeId
             * @returns {*}
             */
            getNodeById: function(nodeId) {
                return this.nodes[nodeId];
            },

            /**
             * Connect input/output thats created with start node
             *
             * @param terminal
             * @param nodeId
             * @param isInput
             * @param terminalId
             * @private
             */
            _connectSystemNode: function(terminal, nodeId, isInput, terminalId) {
                var node = this.getNodeById(nodeId),
                    type = !isInput ? 'input' : 'output',
                    nodeTer = node.getTerminalById(terminalId, type);

                this.Event.trigger('connection:create', terminal, nodeTer);
            },

            /**
             * Check if are intersects with current position of mouse while dragging connection
             *
             * @param coords
             * @param terminal
             */
            checkAreaIntersect: function(coords, terminal) {

                var areaWidth = this.constraints.dropArea.width;

                if (!this.mouseoverTerminal) {

                    if (coords.x1 <= areaWidth && this.dropZoneRect.isInput) {
                        this._createSystemNode(this.dropZoneRect.isInput, coords.x1, coords.y1, terminal);
                    }

                    if (coords.x2 >= (this.canvas.width - areaWidth) && !this.dropZoneRect.isInput) {
                        this._createSystemNode(this.dropZoneRect.isInput, coords.x2, coords.y2, terminal);
                    }

                }


                if (this.dropZoneRect) {
                    this.dropZoneRect.remove();
                    this.dropZoneRect = null;
                }

            },

            /**
             * Mark drop area public method
             *
             * @param isInput
             */
            markDropArea: function(isInput) {
                this._markCreateArea(isInput);
            },

            /**
             * Generate connection based on temp connection
             * User interaction connection creating
             *
             * @param connection
             */
            createConnection: function(connection) {
                var _self = this,
                    input, output;

                if (!this.tempConnectionRefs) {
                    return;
                }

                input = this.tempConnectionRefs.end;
                output = this.tempConnectionRefs.start;

                _self.connections[connection.id] = Connection.getInstance({
                    model: connection,
                    canvas: _self.canvas,
                    parent: _self.pipelineWrap,
                    nodes: _self.nodes,
                    pipeline: _self,
                    input: input,
                    output: output,
                    element: _self.$parent
                });

                _self.nodes[connection.start_node].addConnection(_self.connections[connection.id]);
                _self.nodes[connection.end_node].addConnection(_self.connections[connection.id]);


                this.Event.trigger('pipeline:change');

            },

            /**
             * Get raphael canvas element
             *
             * @returns {*|Pipeline.pipelineWrap}
             */
            getEl: function() {
                return this.pipelineWrap;
            },

            /**
             * Remove connection
             *
             * @param connection
             */
            removeConnection: function(connection) {

                if (this.connections[connection.id]) {
                    this.connections[connection.id] = null;
                    delete this.connections[connection.id];
                }

            },

            /**
             * Destroys pipeline and its references
             */
            destroy: function() {
                var _self = this,
                    events = ['connection:create', 'scrollbars:draw', 'node:add', 'node:deselect'];

                this.canvas = null;
                this.model = null;

                this.$parent.find('svg').remove();

                _.each(this.connections, function(connection) {
                    connection.destroy();
                });

                _.each(this.nodes, function(node) {
                    node.destroy();
                });

                this.nodes = null;

                _.each(events, function(event) {
                    _self.Event.unsubscribe(event);
                });

                this.Event = null;

                this.values = null;
                this.exposed = null;

                delete this.values;
                delete this.exposed;

                $('body').off('mouseup');
            },

            updateNodeSchema: function(nodeId, x, y) {
                var _self = this;

                if (typeof nodeId === 'undefined') {
                    console.error('Node id must be specified to update its schema');
                    return false;
                }

                var node = this.getNodeById(nodeId),
                    nodeModel = node.model,
                    oldLabel = nodeModel.label;

                var portIncludedInputs = _.filter(node.model.inputs, function(inp) {
                    return inp['sbg:includeInPorts'];
                });

                var _validateAndMatchParams = function(valuesCache, inputs, nid) {
                    _.forEach(valuesCache, function(value, id) {

                        var inputType, match,
                            input = _.find(inputs, function(i) {
                                return id === i.id;
                            });

                        if (input) {

                            inputType = Common.fullParseType(input.type).toLowerCase();
                            match = _matchValueType(inputType, value);

                            if (match) {

                                if (typeof _self.values[nid] === 'undefined') {
                                    _self.values[nid] = {};
                                }

                                _self.values[nid][input.id] = value;

                            } else {
                                Notification.warning('Inputs type missmatch, cannot apply parametars to input: ' + input.id);
                            }

                        } else {
                            Notification.warning('Input "' + id + '" not found.');
                        }
                    });
                };

                var _matchValueType = function(type, value) {
                    var valueType;

                    switch (typeof value) {
                        case 'string':
                            valueType = 'string';
                            break;
                        case 'boolean':
                            valueType = 'boolean';
                            break;
                        case 'number':
                            valueType = 'int';
                            break;
                        case 'object':

                            if (_.isArray(value)) {
                                valueType = 'array';
                            }

                            break;
                        default:
                            valueType = 'null';
                            break;
                    }

                    if (type === 'enum') {
                        return valueType === 'string';
                    }

                    if (type === 'float') {
                        return valueType === 'int' || valueType === 'float';
                    }

                    return valueType.toLowerCase() === type.toLowerCase();
                };

                return this.getApp(nodeModel).then(function(result) {

                    if (result) {
                        var newNode = result;

                        var connections = _.map(node.connections, function(connection) {
                            return connection.model;
                        });

                        var valuesCache = _.clone(_self.values[nodeId], true);
                        var exposedCache = _.filter(_.clone(_self.exposed, true), function(input, ids) {
                            return ids.split(Const.exposedSeparator)[0] === nodeId;
                        });

                        var scatterCache = node.model.scatter;

                        node.removeNode();

                        // we need to do little hacking up since addNode excepts coordinates of a drop
                        var translation = _self.getEl().getTranslation();
                        var canvas = _self._getOffset(_self.$parent[0]);
                        var scale = _self.getEl().getScale().x;

                        x = x * scale;
                        y = y * scale;

                        x = (x + translation.x) + canvas.left;
                        y = (y + translation.y) + canvas.top;

                        newNode.label = oldLabel;
                        newNode.isOutdated = true;  //@todo: remove this, temporarily make all nodes outdated all the time.

                        _.forEach(portIncludedInputs, function(inp) {

                            var input = _.find(newNode.inputs, function(i) {
                                return i.id === inp.id;
                            });

                            if (input) {
                                input['sbg:includeInPorts'] = inp['sbg:includeInPorts'];
                            }

                        });

                        _self.addNode(newNode, x, y, false, function(newId) {

                            var n = _self.getNodeById(newId);

                            // restore connections if possible
                            _.forEach(connections, function(c) {
                                var startTerminal, endTerminal,
                                    flag = false;

                                // swap with new id so connections can try to recreate
                                if (c.start_node === nodeId) {
                                    c.start_node = newId;
                                }

                                if (c.end_node === nodeId) {
                                    c.end_node = newId;
                                }

                                // try to validate inputs and create connection
                                if (c.end_node === newId) {
                                    startTerminal = _self.getNodeById(c.start_node).getTerminalById(c.output_name, 'output');
                                    endTerminal = n.getTerminalById(c.input_name, 'input');

                                    flag = startTerminal && endTerminal;
                                }

                                if (c.start_node === newId) {
                                    endTerminal = _self.getNodeById(c.end_node).getTerminalById(c.input_name, 'input');
                                    startTerminal = n.getTerminalById(c.output_name, 'output');

                                    flag = startTerminal && endTerminal;
                                }

                                if (flag) {
                                    _self.Event.trigger('connection:create', endTerminal, startTerminal);
                                } else {
                                    Notification.warning('Terminal mismatch, Some connections cannot be recreated after update.');
                                }
                            });

                            // merge values and exposed parameters if possible
                            _validateAndMatchParams(valuesCache, n.model.inputs, newId);

                            _.forEach(exposedCache, function(exposed) {
                                var inp = _.find(n.model.inputs, function(i) {
                                    return i.id === exposed.id;
                                });

                                if (inp) {
                                    _self.exposed[newId + Const.exposedSeparator + exposed.id.slice(1)] = _.clone(exposed, true);
                                } else {
                                    Notification.warning('Cannot find input "' + exposed.id + '" on updated node to expose it.');
                                }
                            });

                            if (typeof scatterCache === 'string') {
                                var t = n.getTerminalById(scatterCache, 'input');

                                if (t) {
                                    n.model.scatter = scatterCache;
                                }
                            }


                            Notification.primary('Successfully updated node schema.');
                        });


                    } else {
                        console.error('Failed to update node schema: Message: %s, Status: %s', result.message, result.status);
                        Notification.error('Failed to update node schema: Message: ' + result.message + ', Status: ' + result.status);
                    }

                    return this;
                }, function(err) {
                    console.log(err);
                });

            },

            /**
             * Add node to the canvas
             *
             * @param nodeModel
             * @param clientX
             * @param clientY
             * @param rawCoords
             * @param callback
             */
            addNode: function(nodeModel, clientX, clientY, rawCoords, callback) {

                var _self = this,
                    rawModel = angular.copy(nodeModel.json || nodeModel),
                    model;

                if (typeof rawModel['class'] !== 'string' && !Common.checkSystem(rawModel)) {
                    Notification.error('App not valid: Missing class property');
                    return false;
                }

                var type;

                switch (rawModel['class']) {
                    case 'Workflow':
                        type = 'workflow';
                        break;
                    case 'CommandLineTool':
                        type = 'tool';
                        break;
                    case 'ExpressionTool':
                        type = 'script';
                        break;
                }

                var _createNode = function() {
                    if (nodeModel.type && nodeModel.type === 'workflow') {
                        model = _self._transformWorkflowModel(nodeModel);
                    } else {
                        model = _self._transformModel(nodeModel);
                    }

                    var zoom = _self.getEl().getScale().x;

                    var canvas = _self._getOffset(_self.$parent[0]);

                    rawCoords = rawCoords || false;

                    var x = ( clientX - canvas.left ) - _self.pipelineWrap.getTranslation().x,
                        y = ( clientY - canvas.top  ) - _self.pipelineWrap.getTranslation().y;

                    if (rawCoords) {
                        x = clientX - _self.pipelineWrap.getTranslation().x;
                        y = clientY - _self.pipelineWrap.getTranslation().y;
                    }

                    model.x = x / zoom;
                    model.y = y / zoom;

                    // Cache App id to place it in step.run
                    // and use generated id from label
                    if (model.id) {
                        model.appId = model['sbg:id'];
                    }

                    var _id = Common.generateNodeId(model, _self.nodes);

                    model['sbg:id'] = model.id = _id;
                    model.label = model.label ? model.label : model.id;

                    if (_.isEmpty(_self.model.schemas)) {
                        _self.model.schemas = {};
                    }

                    _self.model.schemas[model.id] = rawModel;

                    _self.Event.trigger('node:add', model);

                    if (typeof callback === 'function') {
                        callback(_id);
                    }
                };

                if (Common.checkSystem) {
                    _createNode();
                } else {
                    Validator.validate(type, rawModel)
                        .then(function() {

                            _createNode();

                        }, function(trace) {
                            Notification.error('App not valid:' + trace);
                        });
                }

            },

            deleteSelected: function() {
                _.forEach(this.selectedNodes, function(node) {
                    node.removeNode();
                });
            },

            _checkOutdated: function() {
                var _self = this;
                //var list = [];

                //_.forEach(this.model.nodes, function(node) {
                //    if (!Common.checkSystem(node)) {
                //        list.push(node['sbg:id']);
                //    }
                //});

                // fixme: temporarily removing checks if tool is outdated. Always allowing user to update tool
                _.forEach(_self.nodes, function(node) {
                    if (!Common.checkSystem(node) && node.model.class && !node.model['sbg:id']) {
                        node.setOutdated(true);
                    }
                });

                //App.checkOutdatedInWf(list).then(function(response) {
                //    var map = response.message;
                //
                //    _.forEach(map, function(isOutdated, nodeId) {
                //
                //        if (isOutdated) {
                //
                //            _.forEach(_self.nodes, function(node) {
                //
                //                if (!Common.checkSystem(node.model)) {
                //
                //                    if (node.model['sbg:id'] === nodeId) {
                //                        node.setOutdated(true);
                //                    }
                //                }
                //            });
                //        }
                //    });
                //
                //}, function(err) {
                //    console.error(err);
                //});

            },

            /**
             * Adjust canvas dimensions to fit the parent
             */
            adjustSize: function(showSidebar) {

                var width;

                if (_.isUndefined(showSidebar)) {
                    width = this.$parent[0].offsetWidth - 10;
                } else if (showSidebar) {
                    width = initWidth;
                } else {
                    width = initWidth + 315;
                }

                var height = this.$parent[0].offsetHeight || this.$parent[0].parentNode.offsetHeight;

                if (height > 0) {
                    height -= 10;
                }

                // handling bug with svg in hidden element
                if (width < 0 || height < 0) {
                    return false;
                }

                this.canvas.setSize(width, height);

                this.rect.attr({
                    width: width,
                    height: height
                });

                this._drawScrollbars();

            },

            _prepareExposedValues: function(exposed, values) {

                _.forEach(exposed, function(schema, hash) {

                    var h = hash.split(Const.exposedSeparator),
                        node_id = h[0],
                        param_id;

                    if (h.length > 2) {
                        h.shift();
                        param_id = h.join(Const.exposedSeparator);
                    } else {
                        param_id = h[1];
                    }

                    if (typeof values[node_id] !== 'undefined' && typeof values[node_id][param_id] !== 'undefined') {
                        delete values[node_id][param_id];
                    }

                });

            },

            /**
             * Update schema for input/output node
             *
             * @param {string} id
             * @param {array} type
             //* @param {string} [newId]
             * @param {string} [description]
             */
            updateIOSchema: function(id, type, /*newId,*/ description) {

                var n = this.getNodeById(id).model;
                var nSchema = n.inputs[0] || n.outputs[0];

                var node = this.model.schemas[id];
                var schema = node.inputs[0] || node.outputs[0];

                schema.type = type;
                nSchema.type = type;

                if (description) {
                    node.description = description;
                    schema.description = description;
                    n.description = description;
                    nSchema.description = description;
                }

                schema['sbg:includeInPorts'] = true;
                nSchema['sbg:includeInPorts'] = true;

                this.Event.trigger('pipeline:change', true);
            },

            /**
             * Update workflow metadata
             *
             * @param metadata
             */
            updateMetadata: function(metadata) {

                var _mergeSBGProps = function(json, model) {
                    _.forEach(json, function(val, key) {
                        if (key.indexOf('sbg') !== -1 || key === 'description' || key === 'label') {
                            model[key] = val;
                        }
                    });

                    return model;
                };

                this.Event.trigger('pipeline:change', true);

                return _mergeSBGProps(metadata, this.model);
            },

            /**
             * Return SVG element converted to string.
             * @returns {string}
             */
            getSvgString: function() {

                var tempSvgContainer = $('<div></div>'), // create temporary DIV element that will contain SVG
                    pipWrap = this.pipelineWrap,
                    scale = 1,
                    padding = 20,
                    pipBBox, canvasPadding, canvas, canvasStyle, svgString;


                //// So that Safari wouldn't render INFO, REMOVE, EDIT buttons of a node
                this.Event.trigger('node:deselect', true);

                // scale pipeline to 1 scale factor
                pipWrap.scale(scale, scale);

                // get pipeline element's bounding box
                // NOTE: SVG element needs to be in DOM for this function to return proper result
                pipBBox = pipWrap.getElementBBox();

                canvasPadding = padding * (scale + 1);

                // create RaphaelJS SVG canvas, and put it into temporary DIV created above
                canvas = new Raphael(tempSvgContainer[0], Math.ceil(pipBBox.width + canvasPadding), Math.ceil(pipBBox.height + canvasPadding));

                // remove default style properties
                canvasStyle = canvas.canvas.style;
                canvasStyle.removeProperty('position');
                canvasStyle.setProperty('overflow', 'scroll');

                // Setting ID to the pipeline wrapp element so it can be easier to fetch later
                pipWrap.node.setAttribute('id', 'pipeline-wrapper-node');

                //  translate pipeline to (0, 0) coordinates
                pipWrap.translate(padding, padding);

                // translate each node by negating pipeline's bounding box (x, y) values
                _.each(this.nodes, function(node) {
                    node.addTranslation(-pipBBox.x, -pipBBox.y);
                }, this);

                // Add pipeline node to newly created SVG canvas
                canvas.canvas.appendChild(pipWrap.node);

                // get SVG string from the temporary canvas container
                svgString = tempSvgContainer.html();

                canvas.canvas.remove();

                svgString = svgString.replace(/NS\d*?\:href/g, 'xlink:href');

                // return SVG element as a string
                return svgString;
            },

            updateNodePorts: function(nodeId, inputId, value) {

                var node = this.getNodeById(nodeId);

                var terminal = _.find(node.model.inputs, function(input) {
                    return input.id === inputId;
                });

                if (terminal) {
                    terminal['sbg:includeInPorts'] = value;
                    node.reRenderTerminals();

                    if (!value) {
                        if (node.model.scatter === inputId) {
                            node.model.scatter = false;
                            delete node.model.scatter;
                        }
                    }
                }
            },

            /**
             * Get pipeline model
             *
             * @returns {{}}
             */
            getJSON: function() {

                var json = angular.copy(this.model),
                    exposed = angular.copy(this.exposed),
                    values = angular.copy(this.values),
                    suggestedValues = angular.copy(this.suggestedValues),
                    schemas;

                this._prepareExposedValues(exposed, values);

                if (_.isEmpty(json.schemas)) {
                    json.schemas = schemas = {};
                } else {
                    schemas = json.schemas;
                }

                json.relations = this._getConnections();
                json.nodes = this._getNodes();

                _.each(json.nodes, function(node) {
                    var nodeId = node.id;

                    if (_.isEmpty(schemas[nodeId])) {
                        schemas[nodeId] = {};
                    }

                    schemas[nodeId].display = {
                        x: node.x,
                        y: node.y
                    };

                    if (typeof node.scatter !== 'undefined') {
                        json.schemas[nodeId].scatter = node.scatter;
                    } else {
                        delete json.schemas[nodeId].scatter;
                    }

                    if (typeof node.suggestedValue !== 'undefined') {
                        json.schemas[nodeId].suggestedValue = node.suggestedValue;
                    }

                    json.schemas[nodeId].label = node.label;

                    _.forEach(node.inputs, function(input) {

                        if (input['sbg:includeInPorts'] !== 'undefined') {

                            var i = _.find(json.schemas[nodeId].inputs, function(inp) {
                                return input.id === inp.id;
                            });

                            i['sbg:includeInPorts'] = input['sbg:includeInPorts'];

                        }
                    });

                    _.forEach(node.outputs, function(output) {

                        if (output['sbg:includeInPorts'] !== 'undefined') {

                            var out = _.find(json.schemas[nodeId].outputs, function(inp) {
                                return output.id === inp.id;
                            });

                            out['sbg:includeInPorts'] = output['sbg:includeInPorts'];

                        }
                    });

                    delete node.x;
                    delete node.y;
                });

                json.display.canvas.x = this.getEl().getTranslation().x;
                json.display.canvas.y = this.getEl().getTranslation().y;

                return Formater.toRabixSchema(json, exposed, values, suggestedValues);
            },


            getHints: function() {
                return this.model.hints;
            },

            getRequireSBGMetadata: function() {
                return this.model.requireSBGMetadata;
            },

            updateWorkflowSettings: function(hints, require) {

                this.model.requireSBGMetadata = require;


                this.model.hints = hints;

                return true;
            },

            /**
             * Zooming finished callback
             *
             * @private
             */
            _zoomingFinish: function() {
                this._drawScrollbars();

                this.Event.trigger('pipeline:zoom', this.isZoomOutOfConstraint());

                this.model.display.canvas.zoom = this.currentScale;
            },

            /**
             * Init zoom level
             * Returns current canvas scale
             *
             * @returns {*|number}
             */
            initZoom: function() {
                this._initZoomLevel(this.currentScale);

                this.Event.trigger('pipeline:zoom', this.isZoomOutOfConstraint());

                return this.currentScale;
            },

            /**
             * Calculate if zoom level is within the limits.
             *
             * @return {zoonIn: boolean, zoomOut: boolean} Value is true if the value is on or beyond the limit.
             *
             */
            isZoomOutOfConstraint: function() {
                return {
                    zoomIn: this.currentScale >= this.constraints.zoomInCap,
                    zoomOut: this.currentScale <= this.constraints.zoomOutCap
                };
            },

            /**
             * Canvas zoom in
             * Returns current canvas scale
             *
             * @returns {*|number}
             */
            zoomIn: function() {
                var canvas = this.getEl(),
                    canvasBox = canvas.node.getBBox(),
                    canvasTransform = canvas.node.getCTM(),
                    canvasRect = canvasBox,
                    scale = 0.05;

                canvasBox.l = canvasBox.x + canvasTransform.e;
                canvasBox.t = canvasBox.y + canvasTransform.f;
                canvasBox.r = canvasBox.l + (canvasRect.width * canvasTransform.a);

                if (!this.isZoomOutOfConstraint().zoomIn) {

                    this.currentScale += scale;

                    canvas.scaleAtPoint(
                        this.currentScale,
                        {
                            x: canvasBox.r - canvasRect.width / 2,
                            y: canvasBox.t - canvasRect.height / 2
                        }
                    );

                    this._zoomingFinish();
                    this.Event.trigger('pipeline:zoom', this.isZoomOutOfConstraint());
                }

                return this.currentScale;
            },

            /**
             * Canvas zoom out
             * Returns current canvas scale

             * @returns {*|number}
             */
            zoomOut: function() {
                var canvas = this.getEl(),
                    canvasBox = canvas.node.getBBox(),
                    canvasTransform = canvas.node.getCTM(),
                    canvasRect = canvasBox,
                    scale = 0.05;

                canvasBox.l = canvasBox.x + canvasTransform.e;
                canvasBox.t = canvasBox.y + canvasTransform.f;
                canvasBox.r = canvasBox.l + (canvasRect.width * canvasTransform.a);

                if (!this.isZoomOutOfConstraint().zoomOut) {
                    this.currentScale -= scale;

                    canvas.scaleAtPoint(
                        this.currentScale,
                        {
                            x: canvasBox.r - canvasRect.width / 2,
                            y: canvasBox.t - canvasRect.height / 2
                        }
                    );

                    this._zoomingFinish();

                    this.Event.trigger('pipeline:zoom', this.isZoomOutOfConstraint());
                }

                return this.currentScale;

            }


        };

        return {
            getInstance: function(options) {
                return new Pipeline(options);
            }
        };

    }
    ]);
