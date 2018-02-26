import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IpcService} from "../services/ipc.service";
import {merge} from "rxjs/observable/merge";
import {of} from "rxjs/observable/of";
import {filter, flatMap} from "rxjs/operators";

@Injectable()
export class FileRepositoryService {

    private watchedPaths     = [];
    private directoryReloads = new Subject<string>();

    constructor(private ipc: IpcService) {
    }

    watch(path: string): Observable<any> {

        return new Observable(observer => {

            this.watchedPaths.push(path);

            const sub = merge(
                of(path),
                this.directoryReloads.pipe(
                    filter(dir => dir === path)
                )
            ).pipe(
                flatMap(path => this.ipc.request("readDirectory", path))
            ).subscribe(data => {
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

    saveFile(path: string, content: string): Promise<any> {
        return this.ipc.request("saveFileContent", {path, content}).toPromise();
    }

    fetchFile(path: string, forceFetch = false): Promise<string> {
        return this.ipc.request("getLocalFileContent", {path, forceFetch}).toPromise();
    }
}
