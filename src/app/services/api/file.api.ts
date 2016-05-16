import {Injectable} from "@angular/core";
import {SocketService} from "./socket.service";
import {SOCKET_REQUESTS} from "./socket-events";
import {FilePath} from "./api-response-types";
import {Observable} from "rxjs/Observable";

@Injectable()
export class FileApi {

    constructor(private socketService: SocketService) {

    }

    getDirContent(path: string = ""): Observable<FilePath[]> {
        return this.socketService.request(SOCKET_REQUESTS.DIR_CONTENT, {
            dir: path
        }).map(response => response.content).catch(err => {
            console.error(err);
            return Observable.empty();
        });
    }

    getFileContent(path: string): Observable<string> {
        return this.socketService.request(SOCKET_REQUESTS.FILE_CONTENT, {
            file: path
        }).map(response => response.content).catch(err => {
            console.error(err);
            return Observable.empty();
        })
    }

    createFile(path: string, content?: string): Observable<FilePath> {
        return this.socketService.request(SOCKET_REQUESTS.CREATE_FILE, {
            file: path,
            content: content || ''
        }).map(response => response.content).catch(err => {
            console.log(err);
            return Observable.empty();
        })
    }

    updateFile(path: string, content: string): Observable<boolean> {
        return this.socketService.request(SOCKET_REQUESTS.UPDATE_FILE, {
            file: path,
            content: content
        }).map(response => response.content).catch(err => {
            console.error(err);
            return Observable.empty();
        })
    }
}
