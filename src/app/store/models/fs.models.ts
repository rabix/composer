export type DirectoryChild = DirectoryModel|FileModel;

export class FSItemModel {
    name: string;
    relativePath: string;
    absolutePath: string;
    parentDir: string;

    constructor(attrs: {name: string, relativePath?: string, absolutePath?: string}) {
        this.name         = attrs.name;
        this.relativePath = attrs.relativePath;
        this.absolutePath = attrs.absolutePath;

        if (this.relativePath) {
            this.parentDir = this.relativePath.substring(0, this.relativePath.indexOf(this.name));
        }
    }
}

export class FileModel extends FSItemModel {

    content: string;
    type: string;
    isModified = false;

    constructor(attr: {
        name: string,
        relativePath?: string
        absolutePath?: string
        content?: string,
        type?: string
    }) {
        super(attr);
        this.content = attr.content;
        this.type    = attr.type;
    }
}

export class DirectoryModel extends FSItemModel {
    isEmpty: boolean;

    constructor(attr: {
        name: string,
        relativePath?: string
        absolutePath?: string
        isEmpty?: boolean,
    }) {
        super(attr);
    }
}
