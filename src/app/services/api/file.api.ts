import {Injectable} from "@angular/core";
import {SocketService} from "./socket.service";
import {SOCKET_REQUESTS} from "./socket-events";
import {FilePath, HttpError} from "./api-response-types";
import {Observable} from "rxjs/Rx";
import {DirectoryChild, DirectoryModel, FileModel} from "../../store/models/fs.models";
import {Store} from "@ngrx/store";

@Injectable()
export class FileApi {

    constructor(private socket: SocketService) {
    }

    /**
     * Fetch remote directory content
     */
    getDirContent(path: string = ""): Observable<DirectoryChild[]> {
        return this.socket.request(SOCKET_REQUESTS.DIR_CONTENT, {dir: path})
            .map(resp => {
                return resp.content.map((item: FilePath) => {
                    if (item.type === "directory") {
                        return new DirectoryModel(item);
                    }
                    return new FileModel(item);;
                });
            });
    }

    getFileContent(path: string): Observable<FileModel> {
        return this.socket.request(SOCKET_REQUESTS.FILE_CONTENT, {file: path})
            .map(response => {
                return new FileModel(response.content);
            });
    }

    createFile(path: string, content?: string): Observable<FilePath|HttpError> {
        return this.socket.request(SOCKET_REQUESTS.CREATE_FILE, {
            file: path,
            content: content || ''
        }).map(response => {
            return new FileModel(response.content);
        });
    }

    updateFile(path: string, content: string): Observable<boolean|HttpError> {
        return this.socket.request(SOCKET_REQUESTS.UPDATE_FILE, {
            file: path,
            content: content
        });
    }

    checkIfFileExists(path: string): Observable<boolean|HttpError> {
        console.log('this function is being called');
        return this.socket.request(SOCKET_REQUESTS.FILE_EXISTS, {
            path: path
        }).map(response => {
            console.log(`${path} exists`, response.content);
            return response.content
        });
    }
}
