/**
 * Created by majanedeljkovic on 8/14/15.
 */

import * as config from '../constants/editor.const';

class BaseFile {
    constructor(name, mode, content) {
        this.config = {
            mode: mode,
            theme: config.EDITOR_THEME
        };
        this.name = name;
        this.content = content || '';
    }
}

class YAML extends BaseFile {
    constructor(name, content) {
        super(name, 'yaml', content);
    }
}

class JSON extends BaseFile {
    constructor(name, content) {
        super(name, 'json', content);
    }
}

class JS extends BaseFile {
    constructor(name, content) {
        super(name, 'javascript', content);
    }
}

export {BaseFile, YAML, JSON, JS};