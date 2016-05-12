import {Injectable} from "@angular/core";

class File {

    private path;


    toString(): string {
        return this.path;
    }
}

class Directory {

    private path: string;

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
    constructor() {

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
