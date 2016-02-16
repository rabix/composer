/**
 * Created by Maya on 10.8.15.
 */

import NewFile from '../../services/NewFile';
import * as Keys from '../../services/Shortcuts';

class IdeController {
    constructor(Api, $stateParams, Editor, $scope, Shortcuts, $q, $timeout) {
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

        this.editorApi = {
            onSave: function (tool){
                let deferred = $q.defer();
                this.activeFile.content = JSON.stringify(tool, null, 4);
                this.saveFile(this.activeFile).then((suc) => {
                    deferred.resolve(suc);
                });

                return deferred.promise;
            }.bind(this),
            getJson: function (tool){
                console.log('got json', tool);
            }.bind(this)

        };

        Api.workspaces.query({workspace: $stateParams.workspace},
            (res) => {
                _.forEach(res.files, (file) => {
                    if (file.type) {
                        let fileObj = new NewFile(file.name, file.type, file.content);
                        this.workspace.files.push(makeTab(fileObj));
                    }
                });
            }, (err) => {
                new Error(err);
            });

        this.addKeyboardHandlers($scope, Shortcuts);
    }

    /** File methods **/

    fileAdded(file) {
        let fileObj = makeTab(new NewFile(file.name, file.type, file.content));
        this.workspace.files.push(fileObj);
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
        this.setActiveFile(_.find(this.openFiles, file));
    }
    getClass(content) {
        try {
            let fileContents = JSON.parse(content);
            return fileContents ? fileContents.class : undefined;
        } catch (ex) {
            console.log('could not parse json');
            return undefined;
        }
    }

    saveFile(file) {
        let deferred = this.$q.defer();
        this.Api.files.update({file: file.name, workspace: this.workspace.name, content: file.content},
            (suc) => {
                file.class =  this.getClass(file.content);
                deferred.resolve(suc);
                console.log('successfully updated file', suc);
            }, (err) => {
                deferred.reject(err);
                console.log('something went wrong here', err);
            });
        return deferred.promise;
    }

    loadFile(file) {
        this.Api.files.query({file: file.name, workspace: this.workspace.name},
            (res) => {
                file.class = this.getClass(res.content);
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

function makeTab(obj) {
    obj.slug = _.kebabCase(obj.name);
    return obj;
}

IdeController.$inject = ['Api', '$stateParams', 'Editor', '$scope', 'Shortcuts', '$q', '$timeout'];
angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;