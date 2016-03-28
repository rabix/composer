/**
 * Created by filip on 8.10.14..
 */
'use strict';

angular.module('registryApp.dyole')
    .factory('connection', ['event', 'common', 'lodash', function(Event, Common, _) {

        var Connection = function(options) {

            this.nodeViews = options.nodes;
            this.model = options.model;
            this.canvas = options.canvas;
            this.parent = options.parent;
            this.element = options.element;
            this.Pipeline = options.pipeline;

            this.input = options.input;
            this.output = options.output;

            this.id = this.model.id;

//            this.tempConnectionActive = false;

            this._createConnection(this.input, this.output);
            this._attachEvents();
        };

        Connection.prototype = {

            strokeWidth: 7,
//            strokeColor: '#dddddd',
            strokeColor: '#FBFCFC',

            getEl: function() {
                return this.connection;
            },

            _attachEvents: function() {

                var _self = this,
                    events = [], calcStroke, rmWire, conState;

                calcStroke = function() {
                    _self.draw();
                };

                rmWire = function() {
                    _self.removeWire();
                };

                conState = function(state) {
                    _self.tempConnectionActive = state;
                };

                if (this.Pipeline.editMode) {
                    this.connection.mouseover(this.onMouseOver, this);
                }

                this.Pipeline.Event.subscribe('connection:stroke:calculate', calcStroke);

                events.push({
                    event: 'connection:stroke:calculate',
                    handler: calcStroke
                });

                this.Pipeline.Event.subscribe('remove:wire', rmWire);

                events.push({
                    event: 'remove:wire',
                    handler: rmWire
                });

                this.Pipeline.Event.subscribe('temp:connection:state', conState);

                events.push({
                    event: 'temp:connection:state',
                    handler: conState
                });

                // create pool of events to unsubscribe on destroy
                this.events = events;

            },

            _getOffset: function(element) {

                var bodyRect = document.body.getBoundingClientRect();
                var elemRect = element.getBoundingClientRect();
                var top = elemRect.top - bodyRect.top;
                var left = elemRect.left - bodyRect.left;

                return {top: top, left: left};
            },

            onMouseOver: function(e, x, y) {

                if (!this.Pipeline.tempConnectionActive) {

                    var self = this,
                        src = '/editors/app/' + 'images/wire-cut.png',
                        canvasOffset = this._getOffset(this.element[0]);

                    this.removeWire();

                    this.wire = this.canvas.image(src, x - canvasOffset.left - 15, y - canvasOffset.top - 15, 25, 25);

                    this.wire.click(function() {
                        self.removeWire();
                        self.destroyConnection();
                    });

                    this.wire.mouseout(this.onMouseOut, this);

                    this.startTime = Date.now();

                }

            },

            onMouseOut: function() {
                var diff = this.startTime - Date.now();

                if (this.wire && diff > 1000) {
                    this.wire.remove();
                } else {
                    this.removeWire();
                }
            },

            removeWire: function() {
                if (this.wire) {
                    this.wire.unclick();
                    this.wire.remove();
                }
            },

            draw: function() {

                var coords, strokeWidth,
                    scale = this.parent.getScale().x;

                coords = this._getCoords(this.input, this.output);

                strokeWidth = this.strokeWidth * scale;

                this.connection.redraw(coords, strokeWidth);

                this.removeWire();
            },

            _getCoords: function(input, output) {

                var inputCoords = input.el.node.getCTM(),
                    outputCoords = output.el.node.getCTM(),
                    parentTrans = this.parent.getTranslation(),
                    scale = this.parent.getScale().x;

                inputCoords.e = inputCoords.e / scale;
                inputCoords.f = inputCoords.f / scale;
                outputCoords.e = outputCoords.e / scale;
                outputCoords.f = outputCoords.f / scale;

                inputCoords.e -= parentTrans.x / scale;
                inputCoords.f -= parentTrans.y / scale;
                outputCoords.e -= parentTrans.x / scale;
                outputCoords.f -= parentTrans.y / scale;

                return {
                    x1: inputCoords.e,
                    x2: outputCoords.e,
                    y1: inputCoords.f,
                    y2: outputCoords.f
                };
            },

            _createConnection: function(input, output) {

                var attr, coords,
                    scale = this.parent.getScale().x;

                coords = this._getCoords(input, output);

                attr = {
                    stroke: this.strokeColor,
                    'stroke-width': this.strokeWidth * scale
                };

//            console.log('connection', scale);

                this.connection = this.canvas.curve(coords, attr);
                this.parent.push(this.connection.getPath());
//            this.connection.makeBorder({
//                stroke: '#c8c8c8',
//                'stroke-width': 4
//            });

                this.connection.toBack();

                input.addConnection(this.model.id);
                output.addConnection(this.model.id);

                input.setConnectedState();
                output.setConnectedState();

                input.terminals[output.model.id] = this.model.id;
                output.terminals[input.model.id] = this.model.id;
            },

            destroyConnection: function(pipelineDestroy) {

                var inputCheck, outputCheck;
                var startNode = this.Pipeline.getNodeById(this.model.start_node),
                    endNode = this.Pipeline.getNodeById(this.model.end_node);

                this.connection.remove();

                startNode.removeConnection(this.model);
                endNode.removeConnection(this.model);

                inputCheck = this.input.removeConnection(this.model.id);
                outputCheck = this.output.removeConnection(this.model.id);

                this.input.terminals[this.output.model.id] = null;
                delete this.input.terminals[this.output.model.id];

                this.output.terminals[this.input.model.id] = null;
                delete this.output.terminals[this.input.model.id];

                if (!inputCheck) {
                    this.input.terminalConnected = false;
                    this.input.setDefaultState();
                }

                if (!outputCheck) {
                    this.output.terminalConnected = false;
                    this.output.setDefaultState();
                }

                this.Pipeline.Event.trigger('pipeline:change');

                if (!pipelineDestroy) {
                    this.Pipeline.Event.trigger('connection:destroyed', this.model);
                }
            },

            destroy: function(pipelineDestroy) {
                var _self = this;

                pipelineDestroy = pipelineDestroy || true;

                this.destroyConnection(pipelineDestroy);

                _.each(this.events, function(ev) {
                    _self.Pipeline.Event.unsubscribe(ev.event, ev.handler);
                });
            }
        };

        return {
            getInstance: function(options) {
                return new Connection(options);
            }
        };

    }]);
