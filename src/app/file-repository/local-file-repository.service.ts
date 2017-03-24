import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {IpcService} from "../services/ipc.service";


@Injectable()
export class LocalFileRepositoryService {

    private registry = new BehaviorSubject([]);

    constructor(private ipc: IpcService) {
    }

    watch(directoryPath: string): Observable<any> {
        return this.readDirectory(directoryPath).do(r => {
        });
    }

    fetchDirectoryContent() {

    }

    readDirectory(path): Observable<{
        dirname: string,
        isDir: boolean,
        isFile: boolean,
        isReadable: boolean,
        isWritable: boolean,
        language: string,
        name: boolean,
        path: string,
        type: string
    }> {
        return this.ipc.request("readDirectory", path);
    }
}
