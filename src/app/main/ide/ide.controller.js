/**
 * Created by Maya on 10.8.15.
 */

/* globals _ */

import NewFile from '../../services/NewFile';
import * as Keys from '../../services/Shortcuts';

class IdeController {
    constructor(Api, $stateParams, Editor, $scope, $rootScope, Shortcuts, $q, $timeout) {
        var that = this;

        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.openFiles = [];
        this.workspace = {
            name: $stateParams.workspace,
            files: []
        };
        this.$q = $q;
        this.$timeout = $timeout;
        this.Editor = Editor;
        this.Api = Api;

        this.$scope.directoryLoadingInProgress = true;

        this.structure = {
            name: 'root',
            type: 'dir',
            directories: {},
            files: [],
            baseDir: null
        };

        this.editorApi = {
            editorOnSave: function (blank, tool){
                let deferred = $q.defer();
                this.activeFile.content = JSON.stringify(tool, null, 4);
                this.saveFile(this.activeFile).then((suc) => {
                    deferred.resolve(this.activeFile.content);
                });

                return deferred.promise;
            }.bind(this),
            setToolWorkingCopy: function (blank, tool) {
                this.activeFile.content = JSON.stringify(tool);
            }.bind(this),
            setWorkflowWorkingCopy: function (blank, tool) {
                this.activeFile.content = JSON.stringify(tool);
            }.bind(this)
        };

        this.getApp = function(app) {
            if(Api.Config === null)  {
                return;
            }

            let deferred = $q.defer();
            Api.files.query({file: app.path},
                (res) => {
                    try {
                        let content = JSON.parse(res.content);
                        deferred.resolve(content);
                    } catch (ex) {
                        new Error(ex);
                        deferred.reject('Could not parse JSON for ' + app.path);
                    }
                }, (err) => {
                    new Error(err);
                    deferred.reject(err);
                });

            return deferred.promise;
        };

        this.getToolbox = function () {
            if(Api.Config === null)  {
                return;
            }

            let deferred = $q.defer();

            Api.toolbox.query({},
                (res) => {
                    deferred.resolve(makeTree(res.tools));
                }, (err) => {
                    new Error(err);
                    deferred.reject(err);
                }
            );

            return deferred.promise;
        };

        $rootScope.$on('setupApi', () => that.queryWorkSpace());

        $rootScope.$on('reloadDirectoryTree', function(event, data) {
            that.updateDirectoryTree().then(data.onComplete);
        });

        if (Api.Config !== null) {
            this.queryWorkSpace();
        }

        this.addKeyboardHandlers($scope, Shortcuts);
    }

    /**
     * Update the directory tree without losing the reference to the structure object
     */
    updateDirectoryTree() {
        let deferred = this.$q.defer();

        this.Api.workspaces.query({}, (res) => {
            let newTree = this._createDirectoryTreeStructure(res);


            (function sync(existing, update) {
                existing.files.length = 0;
                for (let f of update.files) {
                    existing.files.push(f);
                }

                for (let name in existing.directories) {
                    if (!update.directories[name]) {
                        delete existing.directories[name];
                    }
                }

                for (let name in update.directories) {
                    let dir = update.directories[name];
                    if (existing.directories[name]) {
                        sync(existing.directories[name], dir);
                    } else {
                        existing.directories[name] = dir;
                    }
                }
            })(this.structure, newTree);

            deferred.resolve(this.structure);
        });

        return deferred.promise;
    }

    /**
     *
     * @param fsResponse
     * @returns {{name: string, type: string, directories: {}, files: Array}}
     * @private
     */
    _createDirectoryTreeStructure(fsResponse) {

        if (fsResponse.paths.length > 0) {
            return makeTree(fsResponse.paths, function (file) {
                return makeTab(new NewFile(file.name, file.type, file.content, file.path, file.fullPath));
            }, false)
        }

        return makeTree([fsResponse.baseDir], null, true);
    }

    queryWorkSpace() {
        this.Api.workspaces.query({},
            (res) => {
                this.structure = this._createDirectoryTreeStructure(res);
            }, (err) => {
                new Error(err);
            }
        );
    }

    /** File methods **/

    fileAdded(file) {
        let fileObj = makeTab(new NewFile(file.name, file.type, file.content, file.path, file.fullPath));
        this.structure.files.push(fileObj);
        if (file.action === 'tool') {
            fileObj.class = 'CommandLineTool';
        } else if (file.action === 'workflow') {
            fileObj.class = 'Workflow';
        }
        this.openFiles.push(fileObj);
        this.setActiveFile(fileObj);
    }

    fileOpened(file) {
        this.setActiveFile(file);
        if (this.openFiles.indexOf(file) !== -1) {
            return;
        }

        this.openFiles.push(file);

        if (!file.content) {
            this.loadFile(file);
        }
    }

    switchFiles(file) {
        if (this.activeFile.class === 'CommandLineTool') {
            this.editorApi.setToolWorkingCopy(this.activeFile.id);
        } else if (this.activeFile.class === 'Workflow') {
            this.editorApi.setWorkflowWorkingCopy(this.activeFile.id);
        }
        this.setActiveFile(_.find(this.openFiles, file));
    }

    getClass(content) {
        try {
            let fileContents = JSON.parse(content);
            return fileContents ? fileContents.class : undefined;
        } catch (ex) {
            return undefined;
        }
    }

    getId(content) {
        try {
            let fileContents = JSON.parse(content);
            return fileContents ? fileContents.id || fileContents['sbg:id'] || fileContents.label : undefined;
        } catch (ex) {
            return undefined;
        }
    }

    saveFile(file) {
        if(this.Api.Config === null)  {
            return;
        }

        let deferred = this.$q.defer();
        this.Api.files.update({file: file.path, content: file.content},
            (suc) => {
                file.class = this.getClass(file.content);
                file.id = this.getId(file.content) || file.fullPath;
                deferred.resolve(suc);
            }, (err) => {
                deferred.reject(err);
                console.log('something went wrong here', err);
            });
        return deferred.promise;
    }

    loadFile(file) {
        if(this.Api.Config === null)  {
            return;
        }

        this.Api.files.query({file: file.path},
            (res) => {
                file.class = this.getClass(res.content);
                file.id = this.getId(res.content) || file.fullPath;
                file.content = res.content;
            }, (err) => {
                console.log('something went wrong here', err);
            });
    }

    closeFile(file) {
        const index = _.indexOf(this.openFiles, file);
        _.remove(this.openFiles, file);
        let length = this.openFiles.length;

        if (file === this.activeFile && length !== 0) {
            if (index < length && index >= 0) {
                this.setActiveFile(this.openFiles[index]);
            } else {
                this.setActiveFile(this.openFiles[length - 1]);
            }
        } else if (length === 0) {
            this.activeFile = null;
            delete this.activeFile;
        }
    }

    setActiveFile(fileObj) {
        this.activeFile = fileObj;
        this.Editor.setMode(fileObj.type);
    }

    getActiveFile() {
        return this.activeFile;
    }

    /**
     * Adds event handlers for keyboard shortcuts
     * @param $scope
     * @param Shortcuts
     */
    addKeyboardHandlers($scope, Shortcuts) {
        $scope.$on(Shortcuts.events.save, () => {
            if (this.activeFile) {
                this.saveFile(this.activeFile)
            }
        });

        $scope.$on(Shortcuts.events.close, function() {
            if (this.activeFile) {
                this.closeFile(this.activeFile);
                $scope.$apply();
            }
        }.bind(this));

        $scope.$on(Shortcuts.events.moveRight, function() {
            if (this.openFiles.length > 1) {
                let index = _.indexOf(this.openFiles, this.activeFile);
                if (index === this.openFiles.length - 1) {
                    this.setActiveFile(this.openFiles[0]);
                } else {
                    this.setActiveFile(this.openFiles[index + 1]);
                }
            }
            $scope.$apply();
        }.bind(this));

        /** Move to left **/
        $scope.$on(Shortcuts.events.moveLeft, function() {
            if (this.openFiles.length > 1) {
                let index = _.indexOf(this.openFiles, this.activeFile);
                if (index === 0) {
                    this.setActiveFile(this.openFiles[this.openFiles.length - 1]);
                } else {
                    this.setActiveFile(this.openFiles[index - 1]);
                }
            }
            $scope.$apply();
        }.bind(this));
    }
}

/**
 * Creates a file tree from a list of paths
 *
 * @param pathList
 * @param [iterateeCallback] should take path object and return the file object that is pushed to directory's files array
 * @returns {{name: string, type: string, directories: {}, files: Array}}
 */
function makeTree(pathList, iterateeCallback, isEmpty) {
    let makeTreeStructure = {
        name: 'root',
        type: 'dir',
        directories: {},
        files: [],
        isRoot: true
    };

    iterateeCallback = _.isFunction(iterateeCallback) ? iterateeCallback : function (file) { return file; };

    pathList = _.isObject(pathList[0]) ? _.sortBy(pathList, 'path') : (pathList).sort();

    if (!isEmpty) {
        _.forEach(pathList, function (file) {
            let tokens = file.path.split('/');
            // remove empty strings for paths that start with /
            tokens = _.filter(tokens, (token) => {
                return token !== '';
            });

            let cwd = makeTreeStructure;

            while (tokens.length) {
                let token = tokens.shift();

                if (tokens.length === 0) {
                    cwd.files.push(iterateeCallback(file));
                } else {
                    if (!cwd.directories[token]) {
                        cwd.directories[token] = {
                            name: token,
                            type: 'dir',
                            directories: {},
                            files: []
                        };
                    }

                    cwd = cwd.directories[token];
                }
            }
        });
    }

    return makeTreeStructure;
}

function makeTab(obj) {
    obj.slug = _.kebabCase(obj.path);
    return obj;
}

IdeController.$inject = ['Api', '$stateParams', 'Editor', '$scope', '$rootScope', 'Shortcuts', '$q', '$timeout'];
angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;
