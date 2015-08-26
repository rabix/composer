/**
 * Created by majanedeljkovic on 8/14/15.
 */

class BaseFile {
    constructor(name, type, content) {
	    this.type = type;
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