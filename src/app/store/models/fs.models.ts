export type DirectoryChild = DirectoryModel|FileModel;

export class FSItemModel {
    protected name: string;
    protected relativePath: string;
    protected absolutePath: string;

    public getName() {
        return this.name;
    }

    public getRelativePath() {
        return this.relativePath;
    }

    public getAbsolutePath() {
        return this.absolutePath;
    }

}

export class FileModel extends FSItemModel {

    private content: string;
    private type: string;
    private modified = false;

    public static createFromObject(data: {
        name: string,
        relativePath?: string
        absolutePath?: string
        content?: string,
        type?: string
    }): FileModel {
        return Object.assign(new FileModel(), data);
    }

    public getType() {
        return this.type;
    }

    public getContent() {
        return this.content;
    }

    public isModified() {
        return this.modified;
    }
}

export class DirectoryModel extends FSItemModel {
    isEmpty: boolean;

    public static createFromObject(data: {
        name: string,
        relativePath?: string
        absolutePath?: string
        isEmpty?: boolean,
        children?: DirectoryChild[]
    }): DirectoryModel {

        return Object.assign(new DirectoryModel(), data);
    }

}
