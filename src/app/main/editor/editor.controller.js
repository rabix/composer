/**
 * Created by Maya on 10.8.15.
 */

import {YamlFile, JsonFile, JsFile} from '../../models/file.model';

class EditorController {
	constructor($timeout) {
		'ngInject';
		let makeTab = function (obj) {
			obj.slug = _.kebabCase(obj.name);
			return obj;
		};

		this.tabs = [
			makeTab(new YamlFile('yaml-file.yaml', `---\n# yaml comment\n-list item`)),
			makeTab(new JsonFile('json-file.json', `{\n\t"json": "file"\n}`)),
			makeTab(new JsFile('javascript.js', 'function hello() {\n\n}'))
		];
	}

	load (editor) {
		editor.$blockScrolling = Infinity;
	}

	switchFiles(file) {
		console.log('calling callback');
		this.activeFile = _.find(this.tabs, {slug: file});
	}
}

angular.module('cottontail').controller('EditorController', EditorController);

export default EditorController;