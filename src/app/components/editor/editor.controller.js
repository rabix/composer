/**
 * Created by Maya on 26.8.15.
 */

import * as config from '../../constants/editor.const';
import * as key from '../../services/Shortcuts';
const _private = new WeakMap();
const _editor = {};

class Editor {
    constructor() {
        this.config = {
            theme: config.EDITOR_THEME,
            mode: 'json',
            onLoad: load
        };
    }

    setMode(mode) {
        this.config.mode = mode;
    }
}

const load = function(editor) {
    _private.set(_editor, editor);

    editor.$blockScrolling = Infinity;
};

angular.module('cottontail').service('Editor', Editor);

export default Editor;