import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IpcService} from "../services/ipc.service";


@Injectable()
export class LocalFileRepositoryService {


    private directoryReloads = new Subject<string>();


    constructor(private ipc: IpcService) {
    }

    watch(path: string): Observable<any> {

        return new Observable(observer => {

            const sub = Observable.merge(
                Observable.of(path),
                this.directoryReloads.filter(dir => dir === path)
            ).flatMap((path) => {
                return this.ipc.request("readDirectory", path);
            }).subscribe(data => {
                observer.next(data);
            }, err => observer.error(err));

            return () => {
                sub.unsubscribe();
            }
        });
    }

    fetchDirectoryContent() {

    }

    reloadPath(path: string): void {
        this.directoryReloads.next(path);
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
