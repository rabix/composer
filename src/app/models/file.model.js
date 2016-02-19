/**
 * Created by majanedeljkovic on 8/14/15.
 */

class BaseFile {
    constructor(name, type, content, path) {
	    this.type = type;
        this.name = name;
        this.content = content || '';
        this.path = path;
    }
}

class YAML extends BaseFile {
    constructor(name, content, path) {
        super(name, 'yaml', content, path);
    }
}

class JSON extends BaseFile {
    constructor(name, content, path) {
        super(name, 'json', content, path);
    }
}

class JS extends BaseFile {
    constructor(name, content, path) {
        super(name, 'javascript', content, path);
    }
}

class TXT extends BaseFile {
    constructor(name, content, path) {
        super(name, 'text', content, path);
    }
}

export {BaseFile, YAML, JSON, JS, TXT};