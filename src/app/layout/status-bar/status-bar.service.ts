import {Injectable, TemplateRef} from "@angular/core";

import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {noop} from "../../lib/utils.lib";
import {Guid} from "../../services/guid.service";
import {StatusBarComponent} from "./status-bar.component";
import {last} from "rxjs/operators";
import {concat} from "rxjs/operators";
import {empty} from "rxjs/observable/empty";


@Injectable()
export class StatusBarService {

    host: StatusBarComponent;

    status = new ReplaySubject<{ message: string, time?: Date }>(1);

    queueSize = new BehaviorSubject(0);

    process: Observable<string>;

    controls = new ReplaySubject<TemplateRef<any>>(1);

    private processMap = {};

    enqueue(process: Observable<string>, completionMessage = "") {

        this.queueSize.next(this.queueSize.getValue() + 1);

        this.process = (this.process || empty()).pipe(
            concat(process)
        );

        process.pipe(
            last()
        ).subscribe(() => {

            this.queueSize.next(this.queueSize.getValue() - 1);

            if (completionMessage) {
                this.setStatus(completionMessage);
            }
        });

        return process;
    }

    startProcess(firstMessage = "", completionMessage = "") {
        const id = Guid.generate();

        const p = new BehaviorSubject(firstMessage);

        this.processMap[id] = p;
        this.enqueue(p, completionMessage);

        p.subscribe(noop, noop, () => {
            delete this.processMap[id];
        });

        return id;
    }

    getProcess(id: string): Subject<string> {
        return this.processMap[id];
    }

    stopProcess(id, status?: string) {
        const p = this.getProcess(id);

        if (!p) {
            console.error(`Process “${id}” doesn't exist.`);
            return;
        }

        if (status) {
            this.setStatus(status);
        }

        p.complete();
    }

    setStatus(message, time = true) {
        this.status.next({message, time: time ? new Date() : undefined});
    }

    setControls(tpl?: TemplateRef<any>) {
        this.controls.next(tpl);
    }

    removeControls() {
        this.controls.next(undefined);
    }

    instant(message: string): void {
        this.stopProcess(this.startProcess(""), message);
    }

}
