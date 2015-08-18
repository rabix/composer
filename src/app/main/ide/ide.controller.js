/**
 * Created by Maya on 10.8.15.
 */

import * as fileModel from '../../models/file.model';
import * as mocks from '../../models/file.mock';

class IdeController {

    constructor (Api, $stateParams) {
        this.openFiles = [];

        this.workspace = {
            name: $stateParams.workspace,
            files: []
        };

        let makeTab = function (obj) {
            obj.slug = _.kebabCase(obj.name);
            obj.config.onLoad = this.load.bind(this);
            return obj;
        }.bind(this);

        Api.workspaces.query({workspace: $stateParams.workspace},
            (res) => {
                _.forEach(res.files, (file) => {
                    if (file.type) {
                        var fileObj = new fileModel[file.type.substring(1).toUpperCase()](file.name, file.content || '');
                        this.workspace.files.push(makeTab(fileObj));
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
        this.workspace.files.push(file);
    }

    fileOpened (file) {
        if (this.openFiles.indexOf(file) !== -1) {return;}
        this.openFiles.push(file);
    }

    switchFiles (file) {
        this.activeFile = this.workspace.files[_.findIndex(this.workspace.files, {slug: file})]; // get file by reference
    }
}


IdeController.$inject = ['Api', '$stateParams'];

angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;