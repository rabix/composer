import {FileName} from "../../components/forms/models/file-name";
export type DirectoryChild = DirectoryModel|FileModel;

export class FSItemModel {
    public readonly id: string;
    public readonly name: string;
    public readonly relativePath: string;
    public readonly absolutePath: string;
    public readonly parentDir: string;
    public exists: boolean;

    constructor(attrs: {name?: string | FileName, relativePath?: string, absolutePath?: string}) {
        this.name         = attrs.name.toString();
        this.relativePath = attrs.relativePath;
        this.absolutePath = attrs.absolutePath;

        if (!this.name && !this.relativePath && !this.absolutePath) {

        }
        // If we don't have the name, we still might be able to infer it

        this.id = this.absolutePath || this.relativePath || Math.random().toString();

        if (this.relativePath) {
            this.parentDir = this.relativePath.substring(0, this.relativePath.indexOf(this.name));
        }
    }
}

export class FileModel extends FSItemModel {

    public readonly type: string;
    public isModified: boolean;
    private _content: string;

    readonly originalContent: string;

    constructor(attr: {
        name: string | FileName,
        relativePath?: string,
        absolutePath?: string,
        content?: string,
        type?: string
    }) {
        super(attr);
        this.content         = attr.content;
        this.originalContent = this.content;
        this.type            = attr.type;
        this.isModified      = false;
    }

    public isSameAs(file: FileModel): boolean {
        return this.id === file.id
    }

    public isChangedSince(file: FileModel): boolean {
        for (let prop in file) {
            if (this[prop] !== file[prop]) {
                return true;
            }
        }

        return false;
    }

    public static fromPath(filename: FileName): FileModel {

        const params = Object.assign({
            name: filename.baseName,
            type: filename.extension
        }, {
            [filename.isAbsolute ? "absolutePath" : "relativePath"]: filename.fullPath
        });

        return new FileModel(params);
    }

    set content(content) {
        this._content   = content;
        this.isModified = this.content !== this.originalContent;
    }

    get content() {
        return this._content;
    }
}

export class DirectoryModel extends FSItemModel {
    isEmpty: boolean;

    constructor(attr: {
        name?: string,
        relativePath?: string
        absolutePath?: string
        isEmpty?: boolean,
    }) {
        super(attr);
        this.isEmpty = attr.isEmpty;
    }
}
