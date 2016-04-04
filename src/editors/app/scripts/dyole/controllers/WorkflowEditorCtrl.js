/**
 * Created by filip on 9.10.14..
 */
'use strict';

angular.module('registryApp.app')
    .controller('WorkflowEditorCtrl', ['$scope', '$rootScope', '$q', '$uibModal',
        '$location', '$templateCache', '$filter',
        'Loading', 'App', 'Const', 'BeforeRedirect',
        'Helper', 'PipelineService', 'lodash', 'Globals', 'BeforeUnload',
        'Api', 'Notification', 'Cliche', '$timeout', 'rawRabixWorkflow',
        function($scope, $rootScope, $q, $modal,
                 $location, $templateCache, $filter,
                 Loading, App, Const, BeforeRedirect,
                 Helper, PipelineService, _, Globals, BeforeUnload,
                 Api, Notification, Cliche, $timeout, rawRabixWorkflow) {

            var PipelineInstance = null;
            var prompt = false;
            var Instances = [];
            var onBeforeUnloadOff = BeforeUnload.register(function() {
                return 'Please save your changes before leaving.';
            }, function() {
                return prompt;
            });

            $scope.$on('pipeline:change', function() {
                prompt = true;
            });

            $scope.view = {};

            $scope.view.pipelineId = '';

            /* expose Globals to template */
            $scope.view.globals = Globals;

            /* loading state of the page */
            $scope.view.loading = true;

            /* current tab for the right sidebar */
            $scope.view.tab = 'apps';

            /* current workflow */
            $scope.view.workflow = {};

            /* group visibility flags for repos */
            $scope.view.groups = {
                myRepositories: false,
                otherRepositories: false
            };

            $scope.refreshingSource = false;

            setTimeout(function(){
                getToolBox();
            }, 100);

            $scope.$watch('externalAppId', function(n, o) {
                if (n !== o) {
                    getToolBox();
                }
            });

            /* visibility flags for repo groups that hold apps */
            $scope.view.repoGroups = {};

            $scope.view.repoTypes = {};

            /* list of my repos */
            $scope.view.MyApps = {};

            /* list of other repos */
            $scope.view.PublicApps = {};

            /* list of user repos*/
            $scope.view.userRepos = [];

            /* flag if something is changed: params or workflow */
            $scope.view.isChanged = false;

            /* flag when save is clicked */
            $scope.view.saving = false;

            /* flag for sidebar visibility */
            $scope.view.showSidebar = true;

            $scope.view.classes = ['page', 'workflow-edit'];
            Loading.setClasses($scope.view.classes);

            $scope.Loading = Loading;

            $scope.view.searchTerm = '';

            $scope.$watch('Loading.classes', function(n, o) {
                if (n !== o) {
                    $scope.view.classes = n;
                }
            });

            function getToolBox() {
                if (!_.isFunction($scope.getToolbox)) {
                    console.error('getToolbox is not a function');
                } else {
                    var result = $scope.getToolbox();

                    if (!result || !result.then) {
                        console.error('Expected to get a promise from getToolbox, instead got: ', result);
                    } else {
                        var deferred = $q.defer();

                        result.then(function(tools) {
                            $scope.view.repoTypes.myApps = tools;
                            deferred.resolve();
                        });

                        return deferred.promise;
                    }
                }
            }

            var onInstanceRegister = function() {
                PipelineInstance = PipelineService.getInstance($scope.view.pipelineId);

                // fixme event object sometimes doesn't exist, could be a race condition
                if (PipelineInstance && PipelineInstance.getEventObj()) {
                    PipelineInstance.getEventObj().subscribe('controller:node:select', onNodeSelect);
                    PipelineInstance.getEventObj().subscribe('controller:node:deselect', onNodeDeselect);
                    PipelineInstance.getEventObj().subscribe('controller:node:destroy', onNodeDestroy);
                }

                console.log('Pipeline Instance cached', PipelineInstance);
            };

            var toggleState = true;

            var toggleAll = function(repo) {

                if (!repo) {
                    toggleAll($scope.view.repoTypes.myApps);
                    toggleState = !toggleState;
                } else {
                    repo.allOpen = toggleState;
                    _.forEach(repo.directories, function(dir) {
                        toggleAll(dir);
                    });
                }
            };

            $scope.resetSearch = function() {
                $scope.view.searchTerm = '';
                toggleState = false;
                toggleAll();
            };

            $scope.$watch('view.searchTerm', function(newVal, oldVal) {

                if (oldVal !== newVal) {

                    if (newVal === '') {
                        $scope.resetSearch();
                    } else {
                        toggleState = true;
                        toggleAll();
                    }
                }

            });

            $scope.refreshSource = function () {
                var minSpinningTime = 1000;
                var startTime = new Date().valueOf();

                if (!$scope.refreshingSource) {
                    $scope.refreshingSource = true;

                    getToolBox().then(function() {
                        var timeDiff = (new Date().valueOf()) - startTime;
                        if (timeDiff < minSpinningTime) {
                            $timeout(function() {
                                $scope.refreshingSource = false;
                            }, minSpinningTime - timeDiff);
                        } else {
                            $scope.refreshingSource = false;
                        }
                    });
                }
            };

            /**
             * Callback when apps are loaded
             *
             * @param {Object} app
             * @private
             */
            function _appsLoaded(app) {
                var workflow;

                // blank workflow is created
                if (app === null) {
                    workflow = _.assign(_.cloneDeep(rawRabixWorkflow), {
                        id: $scope.externalAppId || '',
                        'ct:path': $scope.externalAppPath || '',
                        label: $scope.externalAppPath ? _.last($scope.externalAppPath.split('/')).split('.')[0] : 'Workflow'
                    });
                    // save it immediately
                    _editorSaveCallback(null, workflow);
                } else {
                    //@todo: for whatever reason, when there are multiple editors open, app is undefined and
                    // though the editor saves correctly, it throws an exception. Fix this!

                    if (_.isUndefined(app)) {
                        return;
                    }
                    workflow = JSON.parse(app);
                }

                $scope.view.pipelineId = workflow.id || workflow['sbg:id'] || workflow.label;

                PipelineService.register($scope.view.pipelineId, onInstanceRegister, onInstanceRegister);


                $scope.view.filtering = false;

                if (workflow['sbg:id']) {
                    workflow['sbg:name'] = workflow['sbg:id'].split('/')[2];
                }

                $scope.view.workflow = workflow;

                if ($scope.view.workflow['sbg:validationErrors'] && $scope.view.workflow['sbg:validationErrors'].length > 0) {
                    var rev = parseInt($scope.view.workflow['sbg:revision']);
                    if (rev > 0 && $scope.view.workflow.steps.length !== 0) {
                        _.forEach($scope.view.workflow['sbg:validationErrors'], function(err) {
                            Notification.error(err);
                        });

                        $scope.view.isValid = false;
                    }
                }
                else {
                    $scope.view.isValid = true;
                }

                $scope.view.loading = false;
            }

            $scope.view.loading = false;


            /**
             * Switch tab on the right side
             *
             * @param {string} tab
             */
            $scope.switchTab = function(tab) {
                $scope.view.tab = tab;
            };

            /**
             * Callback when workflow is changed
             */
            $scope.onWorkflowChange = function(value) {
                $timeout(function() {
                    $scope.view.isChanged = value.value;

                    if (!value.value) {
                        $scope.view.saving = false;
                        $scope.view.loading = false;

                        $scope.view.currentAppId = null;
                        $scope.view.json = {};
                    }

                });
            };

            $scope.toggleSidebar = function() {

                $scope.view.showSidebar = !$scope.view.showSidebar;
                PipelineInstance.adjustSize($scope.view.showSidebar);

            };

            $scope.onInputFileSet = function() {
                $scope.onWorkflowChange({value: true, isDisplay: false});
            };

            /**
             * Check if particular property is not exposed anymore and remove it from values schema list
             *
             * @param {string} appName
             * @param {string} key
             */
            $scope.onExpose = function(appName, key) {

                if (!_.isUndefined($scope.view.values[appName]) && !_.isUndefined($scope.view.values[appName][key])) {

                    $scope.view.suggestedValues[appName + Const.exposedSeparator + key.slice(1)] = $scope.view.values[appName][key];
                    delete $scope.view.values[appName][key];
                }

                if (!_.isUndefined($scope.view.values[appName]) && _.isEmpty($scope.view.values[appName])) {
                    delete $scope.view.values[appName];
                }

                $scope.onWorkflowChange({value: true, isDisplay: false});

            };

            $scope.onUnExpose = function(appName, key, value) {
                var keyName = appName + Const.exposedSeparator + key.slice(1);

                if ($scope.view.suggestedValues[keyName]) {
                    delete $scope.view.suggestedValues[keyName];
                }

                if (value) {

                    if (typeof $scope.view.values[appName] === 'undefined') {
                        $scope.view.values[appName] = {};
                    }

                    $scope.view.values[appName][key] = value;

                }
            };
            $scope.onIncludeInPorts = function(appName, key, value) {

                // call onExpose to remove values from values object
                $scope.onExpose(appName, key);
                PipelineInstance.onIncludeInPorts(appName, key, value)
            };

            // think about this when implementing multi select of nodes
            var deepNodeWatch;
            /**
             * Track node select
             */
            var onNodeSelect = function(e, model, exposed, values, suggestedValues) {

                $scope.view.json = model;

                $scope.view.values = values;
                $scope.view.exposed = exposed;
                $scope.view.suggestedValues = suggestedValues;

                _.forEach($scope.view.suggestedValues, function(sugValue, keyName) {
                    var appId = keyName.split(Const.exposedSeparator)[0];
                    var inputId = '#' + keyName.split(Const.exposedSeparator)[1];

                    if (!$scope.view.values[appId]) {
                        $scope.view.values[appId] = {};
                        $scope.view.values[appId][inputId] = sugValue;
                    }
                });

                $scope.view.required = $scope.view.json.inputs.required;

                // TODO: think about this when implementing multi select of nodes
                deepNodeWatch = $scope.$watch('view.values', function(n, o) {
                    if (n !== o) {
                        $scope.onWorkflowChange({value: true, isDisplay: false});
                    }
                }, true);

                $scope.view.inputCategories = _($scope.view.json.inputs).filter(filterInputs).groupBy(function(input) {
                    var cat = input['sbg:category'];

                    if (_.isUndefined(cat) || _.isEmpty(cat) || cat.toLowerCase().trim() === 'uncategorized') {
                        cat = 'Uncategorized';
                    }

                    return cat;

                }).map(function(value, key) {
                    return {
                        name: key,
                        inputs: value,
                        show: true
                    }
                }).value();

                $scope.switchTab('params');
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            function filterInputs(input) {
                var schema = Cliche.getSchema('input', input, 'tool', false);
                var type = Cliche.parseType(schema);
                var items = Cliche.getItemsType(Cliche.getItemsRef(type, schema));
                return (type !== 'File' && items !== 'File');
            }

            /**
             * Track node deselect
             */
            var onNodeDeselect = function() {

                _.forEach($scope.view.suggestedValues, function(sugValue, keyName) {
                    var appId = keyName.split(Const.exposedSeparator)[0];
                    var inputId = '#' + keyName.split(Const.exposedSeparator)[1];

                    if ($scope.view.values[appId] && $scope.view.values[appId][inputId]) {
                        delete $scope.view.values[appId][inputId];

                        if (!_.isUndefined($scope.view.values[appId]) && _.isEmpty($scope.view.values[appId])) {
                            delete $scope.view.values[appId];
                        }
                    }
                });

                $scope.view.json = {};

                if (typeof deepNodeWatch === 'function') {
                    // turn off deep watch for node model
                    deepNodeWatch();
                }

                $scope.switchTab('apps');
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            var onNodeDestroy = function() {
                $timeout(function() {
                    $scope.switchTab('apps');
                });
            };

            /**
             * redirects to a specific revision
             * @param revisionId
             */
            var redirectTo = function(revisionId) {
                prompt = false;
                window.location = '/u/' + Globals.projectOwner + '/' + Globals.projectSlug + '/apps/' + Globals.appName + '/edit?type=' + Globals.appType + '&rev=' + revisionId;
            };

            var onBeforeRedirectOff = BeforeRedirect.register(function() {

                var deferred = $q.defer();

                deferred.resolve();

                return deferred.promise;

            });

            /**
             * Toggle dropdown menu
             */
            $scope.toggleMenu = function() {

                $scope.view.isMenuOpen = !$scope.view.isMenuOpen;

            };

            $scope.view.capitalize = function(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            };

            /**
             * Load markdown modal for description edit
             */
            $scope.loadMarkdown = function() {

                var modalInstance = $modal.open({
                    template: $templateCache.get('views/partials/markdown.html'),
                    controller: 'MarkdownCtrl',
                    windowClass: 'modal-markdown',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        data: function() {
                            return {markdown: $scope.view.workflow.description};
                        }
                    }
                });

                modalInstance.result.then(function(result) {
                    $scope.view.workflow.description = result;
                });
            };

            $scope.editMetadata = function() {

                var json = PipelineInstance.getJSON();

                var modalInstance = $modal.open({
                    template: $templateCache.get('views/dyole/edit-metadata.html'),
                    controller: 'DyoleEditMetadataCtrl',
                    windowClass: 'modal-markdown',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        data: function() {
                            return {tool: json};
                        }
                    }
                });

                modalInstance.result.then(function(result) {
                    PipelineInstance.updateMetadata(result);
                    $scope.view.isChanged = !_.isEqual(result, json) || $scope.view.isChanged;
                });

            };

            /**
             * Load json importer
             */
            $scope.loadJsonImport = function() {

                var modalInstance = $modal.open({
                    template: $templateCache.get('views/cliche/partials/json-editor.html'),
                    controller: 'JsonEditorCtrl',
                    resolve: {
                        options: function() {
                            return {user: $scope.view.user, type: 'workflow'};
                        }
                    }
                });

                modalInstance.result.then(function(json) {

                    if (json) {
                        json = JSON.parse(json);
                        $scope.view.workflow = json;
                        $scope.view.isChanged = true;
                    }
                });

            };

            $scope.workflowSettings = function() {
                var modalInstance = $modal.open({
                    template: $templateCache.get('views/dyole/workflow-settings.html'),
                    controller: 'WorkflowSettingsCtrl',
                    resolve: {
                        data: function() {
                            return {
                                hints: PipelineInstance.getWorkflowHints(),
                                instances: Instances,
                                requireSBGMetadata: PipelineInstance.getRequireSBGMetadata()
                            };
                        }
                    }
                });

                modalInstance.result.then(function(result) {
                    $scope.onWorkflowChange({value: true, isDisplay: false});
                    PipelineInstance.updateWorkflowSettings(result.hints, result.requireSBGMetadata);
                });

            };

            /**
             * Switch to another revision of the app
             */
            $scope.changeRevision = function() {

                var deferred = $q.defer();

                Api.getLatest.get().$promise.then(function(result) {
                    var latestRevision = result.message['sbg:revision'];
                    var revisionsList = _.range(latestRevision + 1);

                    var modalInstance = $modal.open({
                        template: $templateCache.get('views/cliche/partials/revisions.html'),
                        controller: ['$scope', '$uibModalInstance', 'data', function($scope, $modalInstance, data) {

                            $scope.view = data;

                            $scope.cancel = function() {
                                $modalInstance.dismiss('cancel');
                            };

                            $scope.choose = function(id) {
                                $modalInstance.close(id);
                            };

                        }],
                        size: 'sm',
                        windowClass: 'modal-revisions',
                        resolve: {
                            data: function() {
                                return {
                                    revisions: revisionsList,
                                    workflow: $scope.view.workflow,
                                    current: $scope.view.workflow['sbg:revision']
                                };
                            }
                        }
                    });

                    modalInstance.result.then(function(revisionId) {
                        redirectTo(revisionId);

                        // to indicate that something is happening while the page redirects
                        $scope.view.loading = true;
                    });

                    deferred.resolve(modalInstance);
                });


                return deferred.promise;

            };

            $scope.validateWorkflowJSON = function() {

                PipelineInstance.validate().then(function(workflow) {
                    $modal.open({
                        template: $templateCache.get('views/dyole/json-modal.html'),
                        controller: 'ModalJSONCtrl',
                        resolve: {
                            data: function() {
                                return {json: workflow.message, url: false};
                            }
                        }
                    });
                });

            };

            $scope.workflowToJSON = function() {
                var workflow = PipelineInstance.format();

                var modal = $modal.open({
                    template: $templateCache.get('views/dyole/json-modal.html'),
                    controller: 'ModalJSONCtrl',
                    resolve: {
                        data: function() {
                            return {json: workflow};
                        }
                    }
                });

                modal.result.then(function() {
                    PipelineInstance.getUrl({url: App.getAppUrl()});
                });
            };

            $scope.$on('$destroy', function() {
                onBeforeRedirectOff();
                onBeforeRedirectOff = undefined;

                onBeforeUnloadOff();
                onBeforeUnloadOff = undefined;

                //PipelineService.removeInstance($scope.view.pipelineId);
            });


            /**
             * Checks if the callback returned a promise,
             * then runs the correct onSuccess and onError function after the callback finishes
             *
             * @param promise
             * @param onSuccess
             * @param onError
             */
            function _runPostCallback(promise, onSuccess, onError) {
                onSuccess = onSuccess || _.noop;
                onError = onError || _.noop;

                if (!_.isUndefined(promise) && !_.isUndefined(promise.then) && _.isFunction(promise.then)) {
                    promise.then(onSuccess).then(onError);
                } else {
                    onSuccess(promise);
                }
            }

            var _editorSaveCallback = $scope.callbacks.editorOnSave;
            var _setWorkingCopyCallback = $scope.callbacks.setWorkflowWorkingCopy;

            $scope.callbacks.editorOnSave = function(toolId, copyToSave) {
                var workflow = PipelineInstance.format();
                if (workflow && toolId === $scope.view.pipelineId) {
                    var result = _editorSaveCallback(null, workflow);

                    $scope.view.loading = true;
                    _runPostCallback(result, function (result) {
                        $scope.view.loading = false;
                        _appsLoaded(result);
                        Notification.success('Workflow saved successfully');

                    });
                } else if (toolId === null) {
                    _editorSaveCallback(null, copyToSave);
                }
            };

            /**
             * Retrieves current JSON for tool by label from all the workflows currently open.
             * Calls the original setWorkingCopy function by passing the JSON.
             *
             * @param {string} toolId label of reqested tool
             */
            $scope.callbacks.setWorkflowWorkingCopy = function (toolId, workingCopy) {
                if (toolId && _.isString(toolId) &&
                    (toolId === $scope.view.workflow.id ||
                    toolId === $scope.view.workflow['sbg:id'] ||
                    toolId === $scope.view.workflow.label)) {

                    var workflow = _.cloneDeep(PipelineInstance.format());
                    _setWorkingCopyCallback(null, workflow);
                } else if (toolId === null) {
                    _setWorkingCopyCallback(null, workingCopy);
                }
            };

            //@todo: fix hack for loading workflow
            // this is inside a timeout only because otherwise the .pipeline dom element
            // is not initialized at the moment that the canvas should be drawn. canvas init
            // should either wait for domContentLoaded event or setting the app should be delayed
            $timeout(function() {
                _appsLoaded($scope.app);

                $scope.$watch('app', function(n, o) {
                    if (n && n !== o) {
                        _appsLoaded(n);
                    }
                });
            });
        }]);
