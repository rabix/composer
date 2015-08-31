/**
 * Created by Maya on 26.8.15.
 */

import * as config from '../../constants/editor.const';
import * as key from '../../services/Shortcuts';
const _private = new WeakMap();
const _editor = {};
const _callbacks = {};
let hasLoaded = false;
let shortcuts = [];

class Editor {
	constructor() {
		let editor = ace.edit();
		_private.set(_editor, editor);

		this.config = {
			theme: config.EDITOR_THEME,
			onLoad: load
		};
	}

	setMode (mode) {
		this.config.mode = mode;
	}

	addShortcut (name, callback) {
		if (hasLoaded) {
			bindKeys(_private.get(_editor), {name: name, callback: callback});
		} else {
			shortcuts.push({name: name, callback: callback});
		}
	}
}

const load = function (editor) {
	hasLoaded = true;
	_private.set(_editor, editor);

	editor.$blockScrolling = Infinity;
	loadShortcuts();
};

const loadShortcuts = function() {
	shortcuts.forEach(function(shortcut) {
		bindKeys(_private.get(_editor), shortcut);
	});
};

const bindKeys = function(editor, shortcut) {
	editor.commands.addCommand({
		name: shortcut.name,
		bindKey: key.keyMap[shortcut.name].ACE,
		exec: function() {
			shortcut.callback();
		}
	});
};

angular.module('cottontail').service('Editor', Editor);

export default Editor;