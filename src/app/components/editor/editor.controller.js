/**
 * Created by Maya on 26.8.15.
 */

import * as config from '../../constants/editor.const';

class Editor {
	constructor() {
		this.config = {
			theme: config.EDITOR_THEME,
			onLoad: this.load
		};
	}

	load (editor) {
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

	setMode (mode) {
		this.config.mode = mode;
	}
}

angular.module('cottontail').service('Editor', Editor);

export default Editor;