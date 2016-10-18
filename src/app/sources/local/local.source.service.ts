import {Injectable} from "@angular/core";
import {DataEntrySource} from "../common/interfaces";
import {Observable, ReplaySubject} from "rxjs";
import {Stats} from "fs";

const fs    = window.require("fs");
const {app} = window.require("electron").remote;

@Injectable()
export class LocalDataSourceService {

    public load(): Observable<DataEntrySource> {
        const data    = new ReplaySubject<DataEntrySource>(1);
        const homeDir = app.getPath("home");

        const readDir = Observable.bindNodeCallback(fs.readdir);
        const stat    = Observable.bindNodeCallback(fs.lstat);

        //noinspection TypeScriptValidateTypes
        readDir(homeDir)
            .flatMap(Observable.from)
            .flatMap(filename => stat(`${homeDir}/${filename}`).map((s: Stats) => ({
                name: filename,
                isDir: s.isDirectory(),
                isFile: s.isFile()
            })))
            .filter(f => f.name.charAt(0) !== ".")
            .reduce((acc, stat) => acc.concat(stat), [])
            .subscribe(files => {
                console.debug("Read a home directory ", files);
            });

        // fs.readdir(homeDir, (err, files) => {
        //
        //     files.map(filename => ({
        //
        //     }) as DataEntrySource);
        //     console.debug("Read dir",err, files);
        // });


        return data;
    }
}