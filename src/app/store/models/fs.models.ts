import {ObjectHelper} from "../../helpers/object.helper";

export class File {

    name: string;
    relativePath: string;
    absolutePath: string;
    content: string|null;
    isModified = false;

    public static createFromObject(data: {
        name: string,
        relativePath?: string
        absolutePath?: string
        content?: string
    }): File {
        let f = new File();
        ObjectHelper.addEnumerables(f, data);

        return f;
    }
}

export class Directory {
    name: string;
    relativePath: string;
    absolutePath: string;
    isEmpty: boolean;

    public static createFromObject(data: {
        name: string,
        relativePath?: string
        absolutePath?: string
        isEmpty?: string
    }): Directory {
        let d = new Directory();
        ObjectHelper.addEnumerables(d, data);
        return d;
    }
}
