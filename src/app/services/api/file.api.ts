import {Injectable} from "@angular/core";
import {SocketService} from "./socket.service";
import {SOCKET_REQUESTS} from "./socket-events";
import {FilePath} from "./api-response-types";
import {Observable} from "rxjs/Rx";
import {DirectoryModel, FileModel, FSItemModel} from "../../store/models/fs.models";
import {CwlFileTemplate} from "../../types/file-template.type";

@Injectable()
export class FileApi {

    constructor(private socket: SocketService) {
    }

    /**
     * Fetch remote directory content
     */
    getDirContent(path: string = ""): Observable<FSItemModel[]> {
        if (path === "") {
            path = "./";
        }

        return this.socket.request(SOCKET_REQUESTS.DIR_CONTENT, {dir: path})
            .map(resp => resp.content.map((item: FilePath) => {
                if (item.type === "directory") {
                    return <FSItemModel>(new DirectoryModel(item));
                }
                return <FSItemModel>(new FileModel(item));
            }));
    }

    getFileContent(path: string): Observable<FileModel> {
        return this.socket.request(SOCKET_REQUESTS.FILE_CONTENT, {file: path})
            .map(response => new FileModel(response.content));
    }

    createFile(options: {
        path: string,
        content?: string,
        template?: CwlFileTemplate
    }): Observable<FilePath> {
        return this.socket.request(SOCKET_REQUESTS.CREATE_FILE, options).map(r => new FileModel(r.content));
    }

    copyFile(source: string, destination: string): Observable<FileModel> {
        return this.socket.request(SOCKET_REQUESTS.COPY_FILE, {source, destination})
            .map(response => new FileModel(response));
    }

    updateFile(path: string, content: string): Observable<boolean> {
        return this.socket.request(SOCKET_REQUESTS.UPDATE_FILE, {
            file: path,
            content: content
        });
    }

    checkIfFileExists(path: string): Observable<boolean> {
        return this.socket.request(SOCKET_REQUESTS.FILE_EXISTS, {
            path: path
        }).map(response => {
            return response.content
        });
    }
}
