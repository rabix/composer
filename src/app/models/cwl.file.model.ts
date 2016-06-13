export class CwlFile {
    id: string;
    content: any;
    contentReferences: CwlFile[] = [];
    path: string;
    
    constructor(attr: {
        id: string, 
        content: Object, 
        path: string, 
        contentReferences?: CwlFile[]
    }) {
        this.id = attr.id;
        this.content = attr.content;
        this.path = attr.path;
        this.contentReferences = attr.contentReferences;

    }
}
