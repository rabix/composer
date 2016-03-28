/**
 * Author: Milica Kadic
 * Date: 2/3/15
 * Time: 3:00 PM
 */
'use strict';

angular.module('registryApp.cliche')
    .controller('ClicheCtrl', ['$scope', '$q', '$uibModal', '$templateCache',
        '$rootScope', 'App', 'Cliche', 'Loading', 'SandBox', 'BeforeUnload',
        'BeforeRedirect', 'Api', 'lodash',
        'Notification', 'rawTool', 'Helper', 'ClicheEvents', '$location',
        function($scope, $q, $modal, $templateCache,
                 $rootScope, App, Cliche, Loading, SandBox, BeforeUnload,
                 BeforeRedirect, Api, _,
                 Notification, rawTool, Helper, ClicheEvents, $location) {

            $scope.Loading = Loading;

            var cliAdapterWatchers = [];
            var jobWatcher;
            var resourceMap = {
                CPURequirement: 'cpu',
                MemRequirement: 'mem'
            };
            var reqDefaults = {CPURequirement: 1, MemRequirement: 1024};
            var onBeforeUnloadOff = BeforeUnload.register(
                function() {
                    return 'Please save your changes before leaving.';
                },
                function() {
                    return $scope.form.tool.$dirty;
                });
            var instances = [];

            // <editor-fold desc="Local $scope variables">

            $scope.view = {};
            $scope.form = {};

            /* temporary hack because base command cannot have expressions */
            $scope.disableCmdExpressions = true;

            /* form holders, for validation only */
            $scope.form.tool = {};
            $scope.form.job = {};

            /* tool schema holder and job json for testing */
            /** @type CWLTool */
            $scope.view.tool = {};
            /** @type SBGJob */
            $scope.view.job = {};

            /* actual tool app revision from db */
            $scope.view.revision = {};

            /* loading flag */
            $scope.view.loading = true;

            /* cliche mode: always 'edit' on SBG */
            $scope.view.mode = 'edit';

            /* menu visibility flag */
            $scope.view.isMenuVisible = false;

            /* console visibility flag */
            $scope.view.isConsoleVisible = false;

            /* tool type: tool or script */
            //@todo: remove this if necessary
            $scope.view.type = 'tool';

            /* current tab - available: general, inputs, outputs, metadata, test */
            $scope.view.tab = 'general';

            /* page classes */
            $scope.view.classes = ['page', 'cliche'];

            /* command line generator error */
            $scope.view.cmdError = '';

            /* generating command flag */
            $scope.view.generatingCommand = false;

            /* categories */
            $scope.view.categories = [];

            // </editor-fold>

            Loading.setClasses($scope.view.classes);

            Cliche.subscribe(function(cmd) {
                $scope.view.command = cmd;
            });

            /**
             * Cliche events that can be broadcast by various components
             */
            $scope.$on(ClicheEvents.EXPRESSION.CHANGED, function() {
                _checkExpressionRequirement();
            });

            $scope.$watch('Loading.classes', function(n, o) {
                if (n !== o) {
                    $scope.view.classes = n;
                }
            });

            /**
             * Initiate command generating
             */
            $scope.generateCommand = function() {
                Cliche.generateCommand()
                    .then(_outputCommand, _outputError);
            };

            var debouncedGenerateCommand = _.debounce($scope.generateCommand, 200);

            /**
             * Set up cliche form
             *
             * @private
             */
            var _setUpCliche = function() {

                $scope.view.command = '';

                $scope.view.tool = Cliche.getTool();
                $scope.view.job = Cliche.getJob();
            };

            /**
             * Output error message if something was wrong with expressions evaluation
             *
             * @private
             */
            var _outputError = function() {

                $scope.view.generatingCommand = false;
                $scope.view.command = '';
                $scope.view.cmdError = 'There are some errors in some of your expressions';

            };

            /**
             * Output command generated from the form
             *
             * @param {string} command
             * @private
             */
            var _outputCommand = function(command) {

                $scope.view.generatingCommand = false;
                $scope.view.command = command;
                $scope.view.cmdError = '';

            };

            /**
             * Turn on cliAdapter deep watch when console visible
             */
            var _turnOnCliAdapterDeepWatch = function() {

                $scope.view.generatingCommand = true;
                debouncedGenerateCommand();

                var watch = [
                    'view.tool.baseCommand',
                    'view.tool.stdout',
                    'view.tool.stdin',
                    'view.reqMemRequirement.value',
                    'view.reqCPURequirement.value'
                ];

                _.each(watch, function(arg) {
                    var watcher = $scope.$watch(arg, function(n, o) {
                        if (n !== o) {
                            $scope.view.generatingCommand = true;
                            debouncedGenerateCommand();
                        }
                    }, true);
                    cliAdapterWatchers.push(watcher);
                });

            };

            /**
             * Turn off cliAdapter deep watch when console tab is hidden
             */
            var _turnOffCliAdapterDeepWatch = function() {

                _.each(cliAdapterWatchers, function(watcher) {
                    if (_.isFunction(watcher)) {
                        watcher.call();
                    }
                });

                cliAdapterWatchers = [];
            };

            /**
             * Split requirements in separate objects in order to use them directly
             */
            var _readRequirementsAndResources = function() {

                // resources
                /** @type Hint */
                $scope.view.resCPURequirement = _.find($scope.view.tool.hints, {'class': 'sbg:CPURequirement'});
                /** @type Hint */
                $scope.view.resMemRequirement = _.find($scope.view.tool.hints, {'class': 'sbg:MemRequirement'});
                /** @type Hint */
                $scope.view.reqDockerRequirement = _.find($scope.view.tool.hints, {'class': 'DockerRequirement'});

                // requirements
                /** @type Requirement */
                $scope.view.reqCreateFileRequirement = _.find(
                    $scope.view.tool.requirements,
                    {'class': 'CreateFileRequirement'}
                );

                /** @type boolean */
                $scope.view.requireSBGMetadata = !!(_.find($scope.view.tool.requirements, {'class': 'sbg:Metadata'}));

                if ($scope.view.reqCreateFileRequirement && $scope.view.reqCreateFileRequirement.fileDef.length === 0) {
                    _.remove($scope.view.tool.requirements, {'class': 'CreateFileRequirement'});
                    delete $scope.view.reqCreateFileRequirement;
                }
            };

            /**
             * Connects requirement object on $scope.view to object
             * in $scope.view.tool.requirements array.
             *
             * If such a requirement does not exist, will copy req from
             * rawTool and make view object a reference to object in array.
             *
             * @param {string} key
             * @private
             */
            var _connectRequirement = function(key) {
                var tempRequirement = _.find($scope.view.tool.requirements, {'class': key});
                if (!tempRequirement) {
                    $scope.view.tool.requirements.push(_.clone(_.find(rawTool.requirements, {'class': key})));
                    $scope.view['req' + key] = _.find($scope.view.tool.requirements, {'class': key});
                } else {
                    $scope.view['req' + key] = tempRequirement;
                }
            };

            /**
             * @param {string} key One of ['MemRequirement', 'CPURequirement']
             * @private
             */
            var _connectResource = function(key) {
                var tempResource = _.find($scope.view.tool.hints, {'class': 'sbg:' + key});
                if (!tempResource) {
                    $scope.view.tool.hints.push(_.clone(_.find(rawTool.hints, {'class': 'sbg:' + key})));
                    $scope.view['res' + key] = _.find($scope.view.tool.hints, {'class': 'sbg:' + key});
                } else {
                    $scope.view['res' + key] = tempResource;
                }
            };

            var _prepareStatusCodes = function() {
                if (typeof $scope.view.tool.successCodes === 'undefined') {
                    $scope.view.tool.successCodes = [];
                }

                if (typeof $scope.view.tool.temporaryFailCodes === 'undefined') {
                    $scope.view.tool.temporaryFailCodes = [];
                }
            };

            /**
             * Check if there are expressions applied on cpu and mem requirements and evaluate
             * them in order to refresh result for the allocated resources
             *
             * @private
             */
            var _evaluateResources = function() {
                /** @type Hint */
                var resource;

                _.each(resourceMap, function(key, reqName) {
                    resource = $scope.view['res' + reqName];

                    if (resource &&
                        resource.value &&
                        _.isObject(resource.value) &&
                        _.contains(resource.value.value, '$job')) {

                        SandBox.evaluate(resource.value.script, {})
                            .then(function(result) {
                                $scope.view.job.allocatedResources[key] = result;
                            });
                    }
                });
            };

            /**
             * Watch the job in order to evaluate
             * expression which include $job as context
             *
             * @private
             */
            var _turnOnJobDeepWatch = function() {

                _evaluateResources();

                if ($scope.view.isConsoleVisible) {
                    $scope.view.generatingCommand = true;
                    debouncedGenerateCommand();
                }

                jobWatcher = $scope.$watch('view.job.inputs', function(n, o) {
                    if (n !== o) {
                        _evaluateResources();
                        $scope.updateResource($scope.view.resMemRequirement.value, 'MemRequirement');
                        $scope.updateResource($scope.view.resCPURequirement.value, 'CPURequirement');

                        if ($scope.view.isConsoleVisible) {
                            $scope.view.generatingCommand = true;
                            debouncedGenerateCommand();
                        }
                    }
                }, true);
            };

            /**
             * Unwatch job's inputs
             *
             * @private
             */
            var _turnOffJobDeepWatch = function() {

                if (_.isFunction(jobWatcher)) {
                    jobWatcher.call();
                    jobWatcher = null;
                }

            };


            /**
             * Prepares categories for tagsInput directive
             */
            var _setUpCategories = function() {
                $scope.view.categories = _.map($scope.view.tool['sbg:categories'], function(cat) {

                    return {text: cat};
                });
            };

            /**
             * Groups inputs by category and sorts
             *
             */
            function _groupByCategory() {
                $scope.view.inputCategories = _($scope.view.tool.inputs).groupBy(function(input) {
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
                    };
                }).value();
            }

            /**
             * Checks if the app has any expressions.
             *
             * Apps with expressions require an expression engine. It adds an expression engine
             * requirement to apps with any expressions.
             *
             * @private
             */
            var _checkExpressionRequirement = function() {
                if (Helper.deepPropertyEquals($scope.view.tool, 'engine', '#cwl-js-engine')) {
                    $scope.view.expReq = true;
                    if (!_.find($scope.view.tool.requirements, {'class': 'ExpressionEngineRequirement'})) {
                        $scope.view.tool.requirements.push(Cliche.getExpressionRequirement());
                    }
                } else {
                    $scope.view.expReq = false;
                    _.remove($scope.view.tool.requirements, {'class': 'ExpressionEngineRequirement'});
                }
            };


            /**
             * Show tool settings modal (same modal appears in the workflow editor)
             */
            $scope.toolSettings = function() {
                var modalInstance = $modal.open({
                    template: $templateCache.get('views/cliche/partials/settings-modal.html'),
                    controller: 'ToolSettingsCtrl',
                    resolve: {
                        data: function() {
                            return {
                                instances: instances,
                                hints: $scope.view.tool.hints,
                                requireSBGMetadata: $scope.view.requireSBGMetadata,
                                type: 'Tool'
                            };
                        }
                    }
                });

                modalInstance.result.then(function(result) {
                    $scope.view.tool.hints = result.hints;

                    if (result.requireSBGMetadata && !$scope.view.requireSBGMetadata) {
                        $scope.view.tool.requirements.push({
                            'class': 'sbg:Metadata'
                        });
                    } else if (!result.requireSBGMetadata) {
                        _.remove($scope.view.tool.requirements, {'class': 'sbg:Metadata'});
                    }

                    $scope.form.tool.$setDirty();
                    $scope.view.requireSBGMetadata = result.requireSBGMetadata;
                });
            };

            /**
             * Switch the tab
             *
             * @param {string} tab
             */
            $scope.switchTab = function(tab) {
                $scope.view.tab = tab;

                if (tab === 'test') {
                    _groupByCategory();
                    _turnOnJobDeepWatch();
                } else {
                    _turnOffJobDeepWatch();
                }

            };

            /**
             * Toggle markdown preview
             */
            $scope.togglePreview = function() {
                $scope.view.preview = !$scope.view.preview;
            };

            /**
             * Set fresh structure for the cliche playground
             */
            $scope.flush = function() {

                var modalInstance = $modal.open({
                    controller: 'ModalCtrl',
                    size: 'sm',
                    template: $templateCache.get('views/partials/confirm-delete.html'),
                    resolve: {
                        data: function() {
                            return {
                                message: 'Start over with a clean template?'
                            };
                        }
                    }
                });

                modalInstance.result.then(function() {
                    $scope.view.loading = true;

                    $scope.view.tab = 'general';

                    var cachedName = $scope.view.tool.label;

                    Cliche.flush($scope.view.type, cachedName)
                        .then(function() {

                            $scope.view.loading = false;

                            _setUpCliche();
                            _readRequirementsAndResources();
                            _setUpCategories();

                        });

                }, function() {
                    return false;
                });

            };

            /**
             * Sorts inputs/args by position
             *
             * @param {Input|Argument} item
             * @returns {*}
             */
            $scope.sortByPosition = function(item) {

                var position = item.inputBinding && item.inputBinding.position ? item.inputBinding.position : 0; //input
                position = item.position ? item.position : position; //args

                return position;
            };

            /**
             * Updates $scope.view.tool.categories
             */
            $scope.updateCategories = function() {
                $scope.view.tool['sbg:categories'] = _.pluck($scope.view.categories, 'text');
            };

            /**
             * Toggle console visibility
             */
            $scope.toggleConsole = function() {

                $scope.view.isConsoleVisible = !$scope.view.isConsoleVisible;

                if ($scope.view.isConsoleVisible) {
                    _turnOnCliAdapterDeepWatch();
                } else {
                    _turnOffCliAdapterDeepWatch();
                }

            };

            $scope.toggleConsole();

            /**
             * Update tool resources and apply transformation on allocated resources if needed
             *
             * @param {Expression|string} expression
             * @param {string} key
             */
            $scope.updateResource = function(expression, key) {

                //in case field has not yet been defined
                _connectResource(key);

                var resource = $scope.view['res' + key];
                resource.value = expression;

                if (_.isObject(expression)) {

                    SandBox.evaluate(expression.script, {})
                        .then(function(result) {
                            $scope.view.job.allocatedResources[resourceMap[key]] = result;
                        });

                } else {
                    $scope.view.job.allocatedResources[resourceMap[key]] = expression;
                }

            };

            /**
             * Update value from the cliAdapter
             *
             * @param {Expression|string} value
             * @param {number} index
             * @param {string} key
             */
            $scope.updateCliAdapter = function(value, index, key) {
                value = angular.copy(value);

                if (index) {
                    $scope.view.tool[key][index] = value;
                } else {
                    $scope.view.tool[key] = value;
                }

            };

            /**
             * Add item to the baseCommand
             */
            $scope.addBaseCmd = function() {

                $scope.view.tool.baseCommand.push('');

            };

            /**
             * Add fileDef object to CreateFileRequirement.
             *
             * creates requirement if it fileDef was empty.
             */
            $scope.addFileDef = function() {
                if (!$scope.view.reqCreateFileRequirement) {
                    _connectRequirement('CreateFileRequirement');
                }

                $scope.view.reqCreateFileRequirement.fileDef.push({
                    filename: '',
                    fileContent: ''
                });
            };

            /**
             * update fileDef in CreateFileRequirement by index.
             *
             * @param {string | expression} transform
             * @param {number} index
             * @param {string} key
             */
            $scope.updateFileDef = function(transform, index, key) {
                $scope.view.reqCreateFileRequirement.fileDef[index][key] = transform;
            };

            /**
             * Removes fileDef object from CreateFileRequirement by index.
             *
             * if fileDef is empty, then it will remove the whole CreateFileRequirement
             * requirement form the tool.
             *
             * @param {number} index
             */
            $scope.removeFileDef = function(index) {
                $scope.view.reqCreateFileRequirement.fileDef.splice(index, 1);

                if (_.isEmpty($scope.view.reqCreateFileRequirement.fileDef)) {
                    _.remove($scope.view.tool.requirements, {'class': 'CreateFileRequirement'});
                    delete $scope.view.reqCreateFileRequirement;
                }

                $scope.form.tool.$setDirty();
                _checkExpressionRequirement();
            };

            $scope.addStatusCode = function(codeType) {

                if (_.isArray($scope.view.tool[codeType])) {
                    $scope.view.tool[codeType].push(0);
                } else {
                    console.error('Invalid status code key passed');
                    return false;
                }

            };

            /**
             * Remove item from the status codes
             *
             * @param {string} type
             * @param {integer} index
             * @returns {boolean}
             */
            $scope.removeStatusCode = function(type, index) {

                if (!_.isArray($scope.view.tool[type])) {
                    console.error('Invalid status code key passed');
                    return false;
                }

                $scope.form.tool.$setDirty();
                $scope.view.tool[type].splice(index, 1);
            };

            /**
             * Remove item from the baseCommand
             *
             * @param {integer} index
             * @returns {boolean}
             */
            $scope.removeBaseCmd = function(index) {

                if ($scope.view.tool.baseCommand.length === 1) {
                    return false;
                }

                $scope.form.tool.$setDirty();
                $scope.view.tool.baseCommand.splice(index, 1);
            };

            /**
             * Splits single base command into multiple
             *
             * @param {Expression|string} value
             * @param {number} index
             */
            $scope.splitBaseCmd = function(value, index) {
                value = value.replace(/\s+/g, ' ');
                var baseCommands = value.split(' ');
                var adapterBaseCmd = $scope.view.tool.baseCommand;

                if (baseCommands.length > 0) {
                    adapterBaseCmd.splice(index, 1);

                    _.forEach(baseCommands, function(cmd, key) {
                        adapterBaseCmd.splice(parseInt(index, 10) + key, 0, cmd);
                    });

                    //if (!$scope.$$phase) {
                    //    $scope.$apply();
                    //}
                }
            };

            /**
             * Adds a new link field under 'sbg:links'
             */
            $scope.addLink = function() {
                if (_.isUndefined($scope.view.tool['sbg:links'])) {
                    $scope.view.tool['sbg:links'] = [];
                }

                $scope.view.tool['sbg:links'].push({
                    label: '',
                    id: ''
                });
            };

            /**
             * Removes link by index from 'sbg:links'.
             *
             * if 'sbg:links' is empty, then it will remove the whole field from the tool
             *
             * @param {number} index
             */
            $scope.removeLink = function(index) {
                $scope.view.tool['sbg:links'].splice(index, 1);

                if (_.isEmpty($scope.view.tool['sbg:links'])) {
                    delete $scope.view.tool['sbg:links'];
                }

                $scope.form.tool.$setDirty();
            };

            /**
             * Removes the memory or cpu hints when value is set to null or is an empty string
             *
             * Sets default values in jobJson
             */
            $scope.removeResourceHint = function(key) {
                _.remove($scope.view.tool.hints, {'class': 'sbg:' + key});
                delete $scope.view['res' + key];

                $scope.view.job.allocatedResources[resourceMap[key]] = reqDefaults[key]; // set default value

                _checkExpressionRequirement();
            };

            /**
             * Deletes input bindings that are undefined
             *
             * @param {Input} input
             * @private
             */
            function _deleteUndefinedInputBinding(input) {
                var type = Cliche.parseTypeObj(Cliche.getSchema('input', input, 'tool', true));
                if (type.type === 'record') {
                    _.forEach(type.fields, function(field) {
                        _deleteUndefinedInputBinding(field);
                    });
                }

                if (_.isUndefined(input.inputBinding)) {
                    delete input.inputBinding;
                }
            }

            /**
             * Removes empty link and fileDef objects
             *
             * @param tool
             * @private
             */
            function _removeEmptyFields(tool) {
                var createFileReq = _.find(tool.requirements, {'class': 'CreateFileRequirement'});
                if (!_.isUndefined(createFileReq)) {
                    _.remove(createFileReq.fileDef, function(fileDef) {
                        return fileDef.filename === '' && fileDef.fileContent === '';
                    });
                }

                var links = tool['sbg:links'];
                if (!_.isUndefined(links)) {
                    _.remove(links, function(link) {
                        return link.id === '' && link.label === '';
                    });
                }

                _.forEach(tool.inputs, function(input) {
                    _deleteUndefinedInputBinding(input);
                });

                return tool;
            }


            function _setTool(app) {
                var tool;

                // blank app is created
                if (app === '') {
                    tool = _.assign(_.cloneDeep(rawTool), {id: $scope.externalAppId || ''});
                    // save it immediately
                    _saveCallback(null, tool);
                } else {
                    var toolJSON =  JSON.parse(app);
                    tool = _.assign(_.cloneDeep(rawTool), toolJSON);
                }

                /** @type CWLTool */
                $scope.view.app = tool;
                /** @type CWLTool */
                $scope.view.tool = tool;

                tool.hints = tool.hints || [];

                Cliche.setTool(tool);
                var job = $scope.view.revision.job ? JSON.parse($scope.view.revision.job) : null;

                if (!job && typeof tool['sbg:job'] === 'object') {
                    job = tool['sbg:job'];
                }

                Cliche.setJob(job);

                _setUpCliche();
                _readRequirementsAndResources();
                _prepareStatusCodes();
                _setUpCategories();
                _groupByCategory();

                $scope.view.loading = false;
            }


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

            var _saveCallback = $scope.callbacks.onSave;
            var _setWorkingCopyCallback = $scope.callbacks.setToolWorkingCopy;

            $scope.callbacks.onSave = function(toolId, copyToSave) {
                if (toolId && _.isString(toolId) &&
                    (toolId === $scope.view.tool.id ||
                    toolId === $scope.view.tool['sbg:id'] ||
                    toolId === $scope.view.tool.label)) {
                    var promise = _saveCallback(null, _removeEmptyFields(Cliche.getTool()));
                    $scope.view.loading = true;
                    _runPostCallback(promise, function (result) {
                        $scope.view.loading = false;
                        Notification.success('Tool saved successfully');
                    });
                } else if (toolId === null) {
                    _saveCallback(null, copyToSave);
                }

            };

            $scope.callbacks.setToolWorkingCopy = function (toolId, workingCopy) {
                if (toolId && _.isString(toolId) &&
                    (toolId === $scope.view.tool.id ||
                    toolId === $scope.view.tool['sbg:id'] ||
                    toolId === $scope.view.tool.label)) {

                    _setWorkingCopyCallback(null, _removeEmptyFields(Cliche.getTool()));
                } else if (toolId === null) {
                    // until it propagates back to the main controller outside the directive
                    _setWorkingCopyCallback(null, workingCopy);
                }
            };

            $scope.view.loading = true;
            _setTool($scope.app);

            $scope.$watch('app', function (n, o) {
                if (n && n !== o) {
                    _setTool(n);
                }
            });

            $scope.$on('$destroy', function() {
                onBeforeUnloadOff();
                onBeforeUnloadOff = undefined;
            });

        }]);
