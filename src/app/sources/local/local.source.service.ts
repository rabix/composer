import {Injectable} from "@angular/core";
import {DataEntrySource} from "../common/interfaces";
import {Observable, ReplaySubject, Subscriber} from "rxjs";
import {Stats} from "fs";
import {FileName} from "../../components/forms/models";

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

    private getChildrenProvider(dir: string) {
        const readDir = Observable.bindNodeCallback(fs.readdir);
        const stat    = Observable.bindNodeCallback(fs.lstat);

        return readDir(dir)
            .flatMap(Observable.from as any)
            .filter(name => name.charAt(0) !== ".")
            .flatMap(name => {
                const path = `${dir}/${name}`;

                const content = new Observable((subscriber: Subscriber) => {
                    this.readFileContent(path).first().subscribe(content => {
                        subscriber.next(content);
                    });
                });

                return stat(path).map((s: Stats) => ({
                    name,
                    path,
                    isDir: s.isDirectory(),
                    isFile: s.isFile(),
                    isWritable: true,
                    childrenProvider: s.isDirectory() ? this.getChildrenProviderFunction(path) : undefined,
                    content: s.isFile() ? content : undefined,
                    save: s.isFile() ? this.getContentSavingFunction(path) : undefined,
                    id: "local_" + path,
                    language: new FileName(path).extension,
                    type: this.determineContentType(path),
                    sourceId: "local"

                }) as DataEntrySource)
            })
            .reduce((acc, stat) => acc.concat(stat), []);
    }

    private readFileContent(path) {

        return Observable.bindNodeCallback(fs.readFile)(path, "utf8");
    }

    private getContentSavingFunction(path) {

        return content => {
            const start = new ReplaySubject();
            fs.writeFile(path, content, {
                encoding: "utf8",
            }, (err, success) => {
                start.next(arguments);
            });
            return start;
        };

    }

    private getChildrenProviderFunction(path) {
        return _ => this.getChildrenProvider(path);
    }

    private determineContentType(path) {

        const ext = new FileName(path).extension;

        if (["yml", "yaml", "json", "cwl"].indexOf(ext) === -1) {
            return ""
        }

        const loaded = yaml.safeLoad(fs.readFileSync(path, "utf8"), {
            onError: () => {
            }
        });

        return loaded["class"];
    }
}