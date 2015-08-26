/**
 * Created by Maya on 10.8.15.
 */

import NewFile from '../../services/NewFile';

class IdeController {
    constructor (Api, $stateParams, Editor) {
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
    }

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
	    this.setActiveFile(this.openFiles[_.findIndex(this.openFiles, {slug: file})]);
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

	setActiveFile (fileObj) {
		this.activeFile = fileObj;
		this.Editor.setMode(fileObj.type);
	}
}

function makeTab (obj) {
	obj.slug = _.kebabCase(obj.name);
	return obj;
}

IdeController.$inject = ['Api', '$stateParams', 'Editor'];

angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;