import {Injectable} from "@angular/core";
import {FileApi} from "./api/file.api";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {FilePath, HttpError} from "./api/api-response-types";
import {Observable} from "rxjs/Observable";

export class File implements FilePath {
    name: string;
    type: string;
    relativePath: string;
    absolutePath: string;
    public content: BehaviorSubject<FileChangeEvent>;

    constructor(file?: FilePath) {
        this.absolutePath = file.absolutePath;
        this.relativePath = file.relativePath;
        this.type         = file.type;

        this.content = null;
    }

    toString(): string {
        return this.relativePath;
    }
}

type FileChangeEventSource = 'FILE_API' | 'ACE_EDITOR';

export interface FileChangeEvent {
    source: FileChangeEventSource;
    content: string;
}

export class Directory {

    private relativePath: string;
    private absolutePath: string;
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
    private fileCache: {[fileId: string]: File} = {};
    private dirCache: Directory[]               = [];

    private endpoint: string;

    /**
     * @FIXME(ivanb) Create a provider for HTTP which also resolves the API endpoint
     */
    constructor(private fileApi: FileApi) {
        fileApi.getDirContent('').flatMap((paths) => {
            //noinspection TypeScriptUnresolvedFunction
            return Observable.from(paths);
        }).filter((path) => path.type !== 'directory'
        ).subscribe((file) => {
            this.fileCache[file.absolutePath] = new File(file);
        });

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

    public fetchFileContent(file: File): BehaviorSubject<FileChangeEvent> {
        const cachedFile = this.fileCache[file.absolutePath];

        if (cachedFile && cachedFile.content) {

            // push a new event to the stream with the same content as last one, but different source
            cachedFile.content.next({
                source: 'FILE_API',
                content: cachedFile.content.getValue().content
            });

            return cachedFile.content;
        } else {

            let temporarySubject: BehaviorSubject<FileChangeEvent> = new BehaviorSubject({
                source: 'FILE_API',
                content: null
            });

            this.fileApi.getFileContent(file.absolutePath)
                .subscribe((filePath: FilePath|HttpError) => {
                    if ((<HttpError> filePath).error) {
                        // handle error
                    } else {
                        this.fileCache[(<FilePath> filePath).absolutePath]         = new File(<FilePath> filePath);
                        this.fileCache[(<FilePath> filePath).absolutePath].content = temporarySubject;

                        temporarySubject.next({
                            source: 'FILE_API',
                            content: (<FilePath> filePath).content
                        });
                    }
                });

            return temporarySubject;
        }
    }
}
