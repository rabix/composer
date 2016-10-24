import {Injectable} from "@angular/core";
import {DataEntrySource} from "../common/interfaces";
import {Observable, ReplaySubject} from "rxjs";
import {IpcService} from "../../services/ipc.service";

const fs    = window.require("fs");
const {app} = window.require("electron").remote;
const yaml  = require("js-yaml");

type LocalSource = DataEntrySource | {isDir: boolean, isFile: boolean};

@Injectable()
export class LocalDataSourceService {

    public load(): Observable<LocalSource[]> {
        const data    = new ReplaySubject(1);
        const homeDir = app.getPath("home");

        this.getChildrenProvider(homeDir).subscribe(data);

        return data;
    }

    constructor(private ipc: IpcService) {
    }

    private getChildrenProvider(dir: string) {

        return this.ipc.request("readDirectory", dir).flatMap(Observable.from)
            .map(entry => Object.assign(entry,{
                source: "local",
                childrenProvider: entry.isDir ? this.getChildrenProviderFunction(entry.path) : undefined,
                content: !entry.isFile ? undefined : new Observable(sub => {
                    this.readFileContent(entry.path).take(1).subscribe(content => {
                        sub.next(content)
                    })
                }),
                save: entry.isFile ? this.getContentSavingFunction(entry.path) : undefined
            }))
            .reduce((acc, item) => acc.concat(item), [])
    }

    private readFileContent(path) {

        return this.ipc.request("readFileContent", path);
    }

    private getContentSavingFunction(path) {

        return content => this.ipc.request("saveFileContent", {path, content});

    }

    private getChildrenProviderFunction(path) {
        return _ => this.getChildrenProvider(path);
    }
}