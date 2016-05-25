import {Injectable} from "@angular/core";
import {FileApi} from "./api/file.api";

class File {

    private relativePath;
    public content:string;
    private type: string;

    toString(): string {
        return this.relativePath;
    }
}

class Directory {

    private relativePath: string;
    private fullPath: string;
    private isEmpty: boolean;
    
    private type: string;

    private files: File[];
    private directories: Directory[];
}

@Injectable()
export class FileRegistry {

    /**
     * Contains a map of file identifiers to their *content*
     */
    private fileCache: {[fileId: string]: File};
    private dirCache: Directory[];

    private endpoint: string;

    /**
     * @FIXME(ivanb) Create a provider for HTTP which also resolves the API endpoint
     */
    constructor(private fileApi: FileApi) {

        // this.endpoint = "http://localhost:9000";
    }

    public fetchAll() {
        // let files = this.http.get(`${this.endpoint}/api/fs`).map((response: Response) => {
        //     console.log(response);
        //     return response.json()
        // }).subscribe((res) => {
        //     console.log(res)
        // });
    }
}
