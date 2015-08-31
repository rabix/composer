/**
 * Created by Maya on 10.8.15.
 */

import NewFile from '../../services/NewFile';
import * as Keys from '../../services/Shortcuts';

class IdeController {
    constructor (Api, $stateParams, Editor, $scope) {
	    this.$scope = $scope;
        this.openFiles = [];
        this.workspace = {
            name: $stateParams.workspace,
            files: []
        };

	    this.Editor = Editor;
	    this.Api = Api;

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

	    this.createShortcuts();
    }

	/** File methods **/

    fileAdded (file) {
        let fileObj = makeTab(new NewFile(file.name, file.type, file.content));
        this.workspace.files.push(fileObj);
        this.openFiles.push(fileObj);
	    this.setActiveFile(fileObj);
    }

    fileOpened (file) {
	    this.setActiveFile(file);
        if (this.openFiles.indexOf(file) !== -1) {
	        return;
        }

        this.openFiles.push(file);

	    if (!file.content) {
	        this.loadFile(file);
	    }
    }

    switchFiles (file) {
	    this.setActiveFile(_.find(this.openFiles, file));
    }

	saveFile (file) {
		this.Api.files.update({file: file.name, workspace: this.workspace.name, content: file.content},
			(suc) => {
				console.log('successfully updated file', suc);
			}, (err) => {
				console.log('something went wrong here', err);
			});
	}

	loadFile (file) {
		this.Api.files.query({file: file.name, workspace: this.workspace.name},
			(res) => {
				file.content = res.content;
			}, (err) => {
				console.log('something went wrong here', err);
			});
	}

	closeFile (file) {
		const index = _.indexOf(this.openFiles, file);
		_.remove(this.openFiles, file);
		let length = this.openFiles.length;

		if (file === this.activeFile && length !== 0) {
			if (index < length && index >= 0 ) {
				this.setActiveFile(this.openFiles[index]);
			} else {
				this.setActiveFile(this.openFiles[length - 1]);
			}
		} else if (length === 0) {
			this.activeFile = null;
			delete this.activeFile;
		}
	}

	setActiveFile (fileObj) {
		this.activeFile = fileObj;
		this.Editor.setMode(fileObj.type);
	}

	/** Operational methods **/
	createShortcuts() {

		/** Save **/
		Keys.setSave(function(e) {
			if (this.activeFile) {
				this.saveFile(this.activeFile)
			}
			e.preventDefault();
		}.bind(this));

		this.Editor.addShortcut('save', function () {
			this.saveFile(this.activeFile)
		}.bind(this));

		/** Close Tab **/
		Keys.setClose(function(e) {
			if (this.activeFile) {
				this.closeFile(this.activeFile);

				//fixme horrible hack
				this.$scope.$apply();
			}
			e.preventDefault();
		}.bind(this));

		this.Editor.addShortcut('close', function () {
			this.closeFile(this.activeFile);

			//fixme horrible hack
			this.$scope.$apply();
		}.bind(this));

	}
}

function makeTab (obj) {
	obj.slug = _.kebabCase(obj.name);
	return obj;
}

IdeController.$inject = ['Api', '$stateParams', 'Editor', '$scope'];

angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;