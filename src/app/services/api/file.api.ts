import {Injectable} from "@angular/core";
import {SocketService} from "./socket.service";
import {SOCKET_REQUESTS} from "./socket-events";
import {FilePath, HttpError} from "./api-response-types";
import {Observable} from "rxjs/Rx";
import {DirectoryChild, DirectoryModel, FileModel} from "../../store/models/fs.models";

@Injectable()
export class FileApi {

    constructor(private socket: SocketService) {
    }

    /**
     * Fetch remote directory content
     */
    getDirContent(path: string = ""): Observable<DirectoryChild[]> {
        return this.socket.request(SOCKET_REQUESTS.DIR_CONTENT, {dir: path}).map(resp => {
            return resp.content.map((item: FilePath) => {
                if (item.type === "directory") {
                    return DirectoryModel.createFromObject(item);
                }
                return FileModel.createFromObject(item);
            });
        });
    }

    getFileContent(path: string): Observable<FilePath|HttpError> {
        return this.socket.request(SOCKET_REQUESTS.FILE_CONTENT, {
            file: path
        }).map(response => response.content).catch(err => {
            console.error(err);
            //noinspection TypeScriptUnresolvedFunction
            return Observable.of(err);
        })
    }

    createFile(path: string, content?: string): Observable<FilePath|HttpError> {
        return this.socket.request(SOCKET_REQUESTS.CREATE_FILE, {
            file: path,
            content: content || ''
        }).map(response => response.content).catch(err => {
            console.log(err);
            //noinspection TypeScriptUnresolvedFunction
            return Observable.of(err);
        })
    }

    updateFile(path: string, content: string): Observable<boolean|HttpError> {
        return this.socket.request(SOCKET_REQUESTS.UPDATE_FILE, {
            file: path,
            content: content
        }).map(response => response.content).catch(err => {
            console.error(err);
            //noinspection TypeScriptUnresolvedFunction
            return Observable.of(err);
        })
    }

    checkIfFileExists(path: string): Observable<boolean|HttpError> {
        console.log('this function is being called');
        return this.socket.request(SOCKET_REQUESTS.FILE_EXISTS, {
            path: path
        }).map(response => {
            console.log(`${path} exists`, response.content);
            return response.content
        }).catch(err => {
            console.log(err);
            //noinspection TypeScriptUnresolvedFunction
            return Observable.of(err);
        })
    }
}
