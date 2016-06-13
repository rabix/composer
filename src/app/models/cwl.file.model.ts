export class CwlFile {
    id: string;
    content: any;
    contentReferences: CwlFile[] = [];
    path: string;
    
    constructor(id: string, content: Object, path: string) {
        this.id = id;
        this.content = content;
        this.path = path;
    }
}
