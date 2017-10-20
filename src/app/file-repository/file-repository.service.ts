import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IpcService} from "../services/ipc.service";

@Injectable()
export class FileRepositoryService {

    private watchedPaths     = [];
    private directoryReloads = new Subject<string>();

    constructor(private ipc: IpcService) {
    }

    watch(path: string): Observable<any> {

        return new Observable(observer => {

            this.watchedPaths.push(path);

            const sub = Observable.merge(
                Observable.of(path),
                this.directoryReloads.filter(dir => dir === path)
            ).flatMap((path) => {
                return this.ipc.request("readDirectory", path);
            }).subscribe(data => {
                observer.next(data);
            }, err => observer.error(err));

            return () => {

                this.watchedPaths.splice(this.watchedPaths.indexOf(path), 1);
                sub.unsubscribe();
            };
        });
    }

    reloadPath(path: string): void {
        let pathsToReload = [path];

        // If path to reload is not a top-level folder, find the closest folder that is
        if (this.watchedPaths.indexOf(path) === -1) {
            pathsToReload = this.watchedPaths.filter(wp => path.indexOf(wp) === 0).filter((v, i, a) => a.indexOf(v) === i);
        }

        pathsToReload.forEach(path => {
            this.directoryReloads.next(path);
        });

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

    saveFile(path: string, content: string): Promise<any> {
        return this.ipc.request("saveFileContent", {path, content}).toPromise();
    }

    fetchFile(path: string, forceFetch = false): Promise<string> {
        return this.ipc.request("getLocalFileContent", {path, forceFetch}).toPromise();
    }
}
