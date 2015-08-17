/**
 * Created by Maya on 10.8.15.
 */

import {YamlFile, JsonFile, JsFile} from '../../models/file.model';
import * as mocks from '../../models/file.mock';

class IdeController {

	constructor(Api, $stateParams) {

        this.workspace = {};

        Api.workspaces.query({workspace: $stateParams.workspace}, (res) => {
            this.workspace.files = res.files;
        });

		'ngInject';
		let makeTab = function (obj) {
			obj.slug = _.kebabCase(obj.name);
			obj.config.onLoad = this.load.bind(this);
			return obj;
		}.bind(this);

		this.files = [
			makeTab(new YamlFile('yaml-file.yaml', mocks.yaml)),
			makeTab(new JsonFile('json-file.json', mocks.json)),
			makeTab(new JsFile('javascript.js', 'function hello() {\n\n}'))
		];

		this.EditSession = ace.require('ace/edit_session').EditSession;
	}
	load (editor) {
		this._editor = editor;
		editor.$blockScrolling = Infinity;

		editor.commands.addCommand({
			name: 'autoComplete',
			bindKey: {win: 'Ctrl-Space',  mac: 'Ctrl-Space'},
			exec: function(editor) {
				let session = editor.getSession();
				let pos = editor.getCursorPosition();
				let token = session.getTokenAt(pos.row, pos.column);
				let pre = token.value.substr(0, pos.column - token.start);

				console.log(token);
				console.log("word before cursor: ", pre);
			}
		});
	}

	switchFiles(file) {
		if (this.activeFile) {
			this.activeFile.session = new this.EditSession(this.activeFile.content, 'ace/mode/' + this.activeFile.config.mode);
		}

		this.activeFile = this.files[_.findIndex(this.files, {slug: file})]; // get file by reference

		if (this.activeFile.session && this._editor) {
			this._editor.setSession(this.activeFile.session);
		}
	}
}



IdeController.$inject = ['Api', '$stateParams'];

angular.module('cottontail').controller('IdeController', IdeController);

export default IdeController;