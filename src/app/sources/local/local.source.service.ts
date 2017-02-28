import {Injectable} from "@angular/core";
import {DataEntrySource} from "../common/interfaces";
import {Observable, Subject} from "rxjs";
import {IpcService} from "../../services/ipc.service";
import {noop} from "../../lib/utils.lib";

const fs = window["require"]("fs");
const path = window["require"]("path");


type LocalSource = DataEntrySource | { isDir: boolean, isFile: boolean };

type FileIndex = { [folder: string]: LocalSource[] };
@Injectable()
export class LocalDataSourceService {


    public files: Observable<FileIndex>;

    private fileUpdates = new Subject<(index: FileIndex) => FileIndex>();

    constructor(private ipc: IpcService) {

        this.files = this.fileUpdates.scan((files, update: Function) => update(files), {});
    }


    public watch(path) {

        this.getDirContent(path).subscribe(dirContent => {

            const patch = dirContent.reduce((acc, curr) => {
                if (curr.isDir) {
                    acc[curr.path] = []
                }

                acc[curr.dirname] = [...acc[curr.dirname] || [], curr];
                return acc;
            }, {});
            if (!patch[path]) {
                patch[path] = [];
            }

            this.fileUpdates.next((all) => Object.assign({}, all, patch));
        });

        return this.files.map(index => index[path]).filter(dir => !!dir)
            .distinctUntilChanged((a, b) => a.length === b.length)
            .publishReplay(1).refCount();
    }

    private getDirContent(dir: string) {
        return this.ipc.request("readDirectory", dir).flatMap(Observable.from as any)
            .map(entry => this.wrapFileEntry(entry))
            .reduce((acc, item) => acc.concat(item), [])
            .map(dir => dir.sort((a, b) => a.isDir ? -1 : 1));
    }

    private readFileContent(path) {

        return this.ipc.request("readFileContent", path);
    }

    public getContentSavingFunction(path) {

        return content => this.ipc.request("saveFileContent", {path, content});

    }

    public createFile(path, content): Observable<any> {
        const creation = this.ipc.request("createFile", {path, content})
            .map(file => this.wrapFileEntry(file))
            .share();

        creation.switchMap(file => {
            return this.getDirContent(file.dirname).map(dirContent => {
                return {
                    dir: file.dirname,
                    content: dirContent
                }
            });
        }).subscribe(data => {
            this.fileUpdates.next((all) => Object.assign({}, all, {[data.dir]: data.content}));
        }, noop);

        return creation;
    }

    public remove(dirPath): Observable<any> {
        const deletion = this.ipc.request("deletePath", dirPath).share();

        const parentPath = path.dirname(dirPath);

        deletion.switchMap(_ => this.getDirContent(parentPath)).subscribe(listing => {
            this.fileUpdates.next(all => Object.assign({}, all, {[parentPath]: listing}));
        });

        return deletion;
    }

    private wrapFileEntry(entry) {
        let content, save = undefined;

        if (entry.isFile) {
            content = Observable.of(1).switchMap(_ => this.readFileContent(entry.path)).share();
            save = this.getContentSavingFunction(entry.path);
        }


        return Object.assign({}, entry, {
            save,
            content,
            source: "local",
            childrenProvider: entry.isDir ? () => this.watch(entry.path) : undefined,
        });
    }

    public createDirectory(path) {
        const creation = this.ipc.request("createDirectory", path).share();

        creation.switchMap(info => this.getDirContent(info.dirname).map(listing => ({listing, info})))
            .subscribe(data => {
                this.fileUpdates.next(all => Object.assign({}, all, {[data.info.dirname]: data.listing}));
            });

        return creation;
    }
}
