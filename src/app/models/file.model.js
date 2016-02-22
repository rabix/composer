/**
 * Created by majanedeljkovic on 8/14/15.
 */

class BaseFile {
    constructor(name, type, content, path, fullPath) {
	    this.type = type;
        this.name = name;
        this.content = content || '';
        this.path = path;
        this.fullPath = fullPath;
    }
}

class YAML extends BaseFile {
    constructor(name, content, path, fullPath) {
        super(name, 'yaml', content, path, fullPath);
    }
}

class JSON extends BaseFile {
    constructor(name, content, path, fullPath) {
        super(name, 'json', content, path, fullPath);
    }
}

class JS extends BaseFile {
    constructor(name, content, path, fullPath) {
        super(name, 'javascript', content, path, fullPath);
    }
}

class TXT extends BaseFile {
    constructor(name, content, path, fullPath) {
        super(name, 'text', content, path, fullPath);
    }
}

export {BaseFile, YAML, JSON, JS, TXT};