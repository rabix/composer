export class ContentReference {
    refId: any;
    cwlFile: CwlFile
}

export class CwlFile {
    content: any;
    contentReferences: string[];
    
    constructor(content: Object) {
        this.content = content;
        this.contentReferences = [];
    }
}
