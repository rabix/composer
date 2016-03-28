/**
 * Author: Milica Kadic
 * Date: 10/21/14
 * Time: 2:51 PM
 */
'use strict';

angular.module('registryApp.dyole')
    .controller('PipelineCtrl', ['$scope', '$rootScope', '$element', '$window', '$timeout', '$injector', 'common', 'pipeline', 'App', 'rawPipeline', '$uibModal', '$templateCache', 'PipelineService', 'lodash', 'Notification', 'HotkeyRegistry', 'rawRabixWorkflow', function($scope, $rootScope, $element, $window, $timeout, $injector, Common, pipeline, App, rawPipeline, $modal, $templateCache, PipelineService, _, Notification, HotkeyRegistry, rawRabixWorkflow) {

        var Pipeline;
        var selector = '.pipeline';
        var timeoutId;

        $scope.view = {};
        $scope.view.canFlush = true;

        /* show usage hints to user flag */
        $scope.view.explanation = false;

        /* disable button if zoom limit is reached */
        $scope.view.disableZoomIn = false;
        $scope.view.disableZoomOut = false;

        /**
         * Initialize pipeline
         */
        var initPipeline = function(obj) {

            $scope.view.explanation = !obj || (obj.steps && obj.steps.length === 0); // || (obj.dataLinks && obj.dataLinks.length === 0);

            Pipeline = pipeline.getInstance({
                model: typeof obj.steps !== 'undefined' ? obj || rawPipeline : rawPipeline,
                $parent: angular.element($element[0].querySelector(selector)),
                editMode: $scope.editMode,
                getApp: $scope.getApp
            });

            // Will be used to check if any of the buttons needs disabling
            Pipeline.initZoom();

        };

        if ($scope.pipeline) {
            initPipeline($scope.pipeline);
        } else {
            initPipeline({});
        }

        if ($scope.previewNode) {

            var e = {
                clientX: 300,
                clientY: 150
            };

            Pipeline.addNode($scope.previewNode, e.clientX, e.clientY);

        }

        $scope.$watch('pipeline', function(n, o) {
            if (n !== o) {

                $scope.pipeline = n;

                if (angular.isDefined(Pipeline)) {
                    Pipeline.destroy();
                    Pipeline = null;
                }

                initPipeline(n);

                PipelineService.refresh($scope.controllerId);
            }
        });

        var fork = function(repoId, name) {
            $scope.pipeline.json = Pipeline.getJSON();

            $scope.pipeline.repo = repoId;

            if (name) {
                $scope.pipeline.name = name;
            }

        };

        /**
         * Save pipeline locally
         */
        $scope.$on('save-local', function(e, value) {
            if (value) {
                //Workflow.saveLocal(Pipeline.getJSON());
            }
        });

        var format = function() {

            return Pipeline.getJSON();
        };

        var getUrl = function(url) {

            $modal.open({
                template: $templateCache.get('views/partials/job-url-response.html'),
                controller: ['$scope', '$uibModalInstance', 'data', function($scope, $modalInstance, data) {

                    $scope.view = {};
                    $scope.data = data;

                    /**
                     * Close the modal window
                     */
                    $scope.ok = function() {
                        $modalInstance.close();
                    };

                }],
                resolve: {
                    data: function() {
                        return {trace: {message: 'Workflow link:', url: url.url}};
                    }
                }
            });


        };

        /**
         * Drop node on the canvas
         *
         * @param {MouseEvent} e
         * @param {String} app object
         */
        var dropNode = function(e, app) {

            $scope.view.loading = true;
            $scope.view.explanation = false;

            if (!_.isFunction($scope.getApp)) {
                $scope.view.loading = false;
                console.error('getApp is not a function!');
                return;
            }

            function getNodeSuccess(result) {
                $scope.view.loading = false;
                if (typeof result === 'object' && !_.isEmpty(result)) {
                    Pipeline.addNode(result, e.clientX, e.clientY);
                }
            }

            function getNodeError() {
                $scope.view.loading = false;

                console.error('App does not exist');
                Notification.error('App does not exist');
            }

            var result = $scope.getApp(app);

            if (!_.isUndefined(result) && !_.isUndefined(result.then) && _.isFunction(result.then)) {
                result.then(getNodeSuccess, getNodeError);
            } else if (!_.isUndefined(result)) {
                getNodeSuccess(result);
            } else {
                getNodeError();
            }
        };

        var onNodeDroppedOff = $rootScope.$on('node:dropped', function(e, data) {
            dropNode(data.e, data.app);
        });

        /**
         * Cancel timeout
         */
        var cancelTimeout = function() {
            if (angular.isDefined(timeoutId)) {
                $timeout.cancel(timeoutId);
                timeoutId = undefined;
            }
        };

        /**
         * Adjust size of the canvas when window size changes
         */
        var changeWidth = function() {
            if (Pipeline) {
                Pipeline.adjustSize();
            }
        };

        var lazyChangeWidth = _.debounce(changeWidth, 150);

        angular.element($window).on('resize', lazyChangeWidth);

        /**
         * Track sidebar toggle in order to adjust canvas size
         */
        var adjustSize = function(showSidebar) {

            cancelTimeout();

            timeoutId = $timeout(function() {
                Pipeline.adjustSize(showSidebar);
            }, 300);

        };

        var getEventObj = function() {
            if (Pipeline) {
                return Pipeline.Event
            } else {
                return false;
            }
        };

        var updateMetadata = function(metadata) {
            if (Pipeline) {
                Pipeline.updateMetadata(metadata);
            }
        };

        var getSvgString = function() {
            if (Pipeline) {
                return Pipeline.getSvgString();
            }
        };

        /**
         * Track pipeline change
         */
        var onPipelineChangeOff = $rootScope.$on('pipeline:change', function(isDisplay) {
            $scope.pipelineChangeFn({value: {value: true, isDisplay: isDisplay}});
        });

        /**
         * Set fresh canvas
         */
        $scope.flush = function() {
            if (!$scope.view.canFlush) {
                return false;
            }

            var modalInstance = $modal.open({
                controller: 'ModalCtrl',
                template: $templateCache.get('views/partials/confirm-delete.html'),
                resolve: {
                    data: function() {
                        return {
                            message: 'Are you sure you want to delete this workflow?'
                        };
                    }
                }
            });

            modalInstance.result.then(function() {
                App.flush();

                var p = Pipeline.getJSON();


                if (angular.isDefined(Pipeline)) {

                    var raw = angular.copy(rawRabixWorkflow);
                    raw.id = p.id;
                    raw.label = p.label;

                    Pipeline.destroy();
                    Pipeline = null;
                    initPipeline(raw);

                    PipelineService.refresh($scope.controllerId);

                }
            }, function() {
                return false;
            });

        };

        /**
         * Open modal with info for selected node
         *
         * @param e
         * @param model
         * @param schema
         */
        var onNodeInfo = function(e, model, schema) {

            var _getConnections = function() {
                var connections = Pipeline.getConnections();

                return _.filter(connections, function(connection) {
                    return connection.end_node === model.id || connection.start_node === model.id;
                });
            };

            var $modal = $injector.get('$uibModal');
            var $templateCache = $injector.get('$templateCache');

            var modalInstance = $modal.open({
                template: $templateCache.get('views/dyole/' + ( schema ? 'io-' : '') + 'node-info.html'),
                controller: 'ModalTabsCtrl',
                windowClass: 'modal-node',
                resolve: {
                    data: function() {
                        return {
                            model: model,
                            connections: _getConnections(),
                            schema: schema,
                            getUniqueId: function(id) {
                                return Common.generateNodeId({name: id}, Pipeline.nodes);
                            }
                        };
                    }
                }
            });

            modalInstance.result.then(function(data) {

                var scatter = data.scatter,
                    connections = Pipeline.getConnections(),
                    node;


                if (!_.isEmpty(data.schema)) {
                    // get schema for i/o node ( copyes schema from *put )
                    var ioType = model.inputs.length ? 'inputs' : 'outputs',
                        schema;

                    schema = model[ioType][0];
                    schema.id = data.nodeId;
                    schema.type = data.schema.type;

                    Pipeline.updateIOSchema(model.id, schema.type, data.schema.description);

                    node = Pipeline.model.schemas[model.id];

                    if (typeof node !== 'undefined') {

                        node.id = data.nodeId;
                        node[ioType][0].id = data.nodeId;

                        delete Pipeline.model.schemas[model.id];
                        Pipeline.model.schemas[data.nodeId] = node;
                    }

                    _.each(connections, function(con) {

                        if (con.start_node === model.id) {
                            con.start_node = data.nodeId;
                            con.output_name = data.nodeId;
                        }
                        else if (con.end_node === model.id) {
                            con.end_node = data.nodeId;
                            con.input_name = data.nodeId;
                        }
                    });
                }
                else {
                    _.each(connections, function(con) {

                        if (con.start_node === model.id) {
                            con.start_node = data.nodeId;
                        }
                        else if (con.end_node === model.id) {
                            con.end_node = data.nodeId;
                        }
                    });
                }

                node = Pipeline.getNodeById(model.id);

                if (typeof node !== 'undefined' && _.isEqual(node.model, model)) {
                    delete Pipeline.nodes[model.id];
                    Pipeline.nodes[data.nodeId] = node;
                    node.reRenderTerminals();
                }

                model.id = data.nodeId || model.id;

                if (scatter) {
                    model.scatter = scatter;
                } else {
                    model.scatter = false;
                    delete model.scatter;
                }

                $scope.pipelineChangeFn({value: {value: true, isDisplay: false}});

            });

        };

        /**
         *
         * @param {Event} e         click event object
         * @param {Object} opts     options
         * @param onSave
         * @param scope
         */
        var onNodeLabelEdit = function(e, opts, onSave, scope) {

            var $modal = $injector.get('$uibModal');
            var $templateCache = $injector.get('$templateCache');

            var template = opts.isSystem ? 'views/dyole/input-label-edit.html' : 'views/dyole/node-label-edit.html';
            $modal.open({
                template: $templateCache.get(template),
                controller: 'NodeEditCtrl',
                windowClass: 'modal-node',
                resolve: {
                    data: function() {
                        return {
                            label: opts.label,
                            onSave: onSave,
                            scope: scope
                        };
                    }
                }
            });

        };

        var onIncludeInPorts = function(nodeId, inputId, value) {
            Pipeline.updateNodePorts(nodeId, inputId, value);
        };

        var getWorkflowHints = function() {
            return Pipeline.getHints();
        };

        var getRequireSBGMetadata = function() {
            return Pipeline.getRequireSBGMetadata();
        };

        var updateWorkflowSettings = function(hints, requireSBGMetadata) {
            return Pipeline.updateWorkflowSettings(hints, requireSBGMetadata);
        };

        var onNodeInfoOff = $rootScope.$on('node:info', onNodeInfo.bind(this));
        var onNodeLabelEditOff = $rootScope.$on('node:label:edit', onNodeLabelEdit);

        $scope.$on('$destroy', function() {

            angular.element($window).off('resize', lazyChangeWidth);

            cancelTimeout();
            onPipelineChangeOff();
            onNodeDroppedOff();
            onNodeInfoOff();
            onNodeLabelEditOff();

            if (angular.isDefined(Pipeline)) {
                //Pipeline.destroy();
                //Pipeline = null;
            }

        });

        var validate = function() {
            return App.validateJson(Pipeline.getJSON());
        };

        HotkeyRegistry.loadHotkeys([
            {name: 'delete', callback: Pipeline.deleteSelected, preventDefault: true, context: Pipeline},
            {name: 'backspace delete', callback: Pipeline.deleteSelected, preventDefault: true, context: Pipeline}
        ]);

        $scope.pipelineActions = {

            zoomIn: function() {

                if (Pipeline) {
                    Pipeline.zoomIn();
                }
            },
            zoomOut: function() {

                if (Pipeline) {
                    Pipeline.zoomOut();
                }

            }
        };

        /**
         * If scope controller is set, expose pipeline methods to service
         */
        $scope.$watch('controllerId', function(n, o) {
            if (n !== '') {

                var methods = {
                    flush: $scope.flush,
                    dropNode: dropNode,
                    getUrl: getUrl,
                    fork: fork,
                    format: format,
                    getJSON: format,
                    validate: validate,
                    adjustSize: adjustSize,
                    getEventObj: getEventObj,
                    updateMetadata: updateMetadata,
                    getSvgString: getSvgString,
                    onIncludeInPorts: onIncludeInPorts,
                    getWorkflowHints: getWorkflowHints,
                    getRequireSBGMetadata: getRequireSBGMetadata,
                    updateWorkflowSettings: updateWorkflowSettings
                };

                PipelineService.setInstance($scope.controllerId, methods);
            }
        });
    }]);
