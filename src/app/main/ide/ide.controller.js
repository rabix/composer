/**
 * Created by Maya on 10.8.15.
 */

import NewFile from '../../services/NewFile';

class IdeController {

    constructor (Api, $stateParams) {
        this.openFiles = [];

        this.workspace = {
            name: $stateParams.workspace,
            files: []
        };

        this.makeTab = function (obj) {
            obj.slug = _.kebabCase(obj.name);
            obj.config.onLoad = this.load.bind(this);
            return obj;
        }.bind(this);

        Api.workspaces.query({workspace: $stateParams.workspace},
            (res) => {
                _.forEach(res.files, (file) => {
                    if (file.type) {
                        let fileObj = new NewFile(file.name, file.type, file.content);
                        this.workspace.files.push(this.makeTab(fileObj));
                    }
                });
            }, (err) => {
                new Error(err);
            });

        this.EditSession = ace.require('ace/edit_session').EditSession;
    }

    load (editor) {
        this._editor = editor;
        editor.$blockScrolling = Infinity;

        editor.commands.addCommand({
            name: 'autoComplete',
            bindKey: {win: 'Ctrl-Space', mac: 'Ctrl-Space'},
            exec: function (editor) {
                let session = editor.getSession();
                let pos = editor.getCursorPosition();
                let token = session.getTokenAt(pos.row, pos.column);
                let pre = token.value.substr(0, pos.column - token.start);

                console.log(token);
                console.log("word before cursor: ", pre);
            }
        });
    }

    fileAdded (file) {
        let fileObj = this.makeTab(new NewFile(file.name, file.type, file.content));
        this.workspace.files.push(fileObj);
        this.openFiles.push(fileObj);
        this.activeFile = fileObj;
    }

    fileOpened (file) {
        if (this.openFiles.indexOf(file) !== -1) {return;}
        this.openFiles.push(file);
        this.activeFile = file;
    }

    switchFiles (file) {
        this.activeFile = this.openFiles[_.findIndex(this.openFiles, {slug: file})]; // get file by reference
    }
}


IdeController.$inject = ['Api', '$stateParams'];

angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;