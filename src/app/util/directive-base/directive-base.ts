import {AfterViewInit, OnDestroy} from "@angular/core";
import {AsyncSubject} from "rxjs/AsyncSubject";
import {Subscription} from "rxjs/Subscription";
import "../rx-extensions/subscribe-tracked";
import {Subject} from "rxjs/Subject";

export abstract class DirectiveBase implements OnDestroy, AfterViewInit {

    /**
     * Holds the subscriptions that need to be disposed when the component gets removed.
     */
    private __disposables: { dispose: string, track: Object }[] = [];

    viewReady = new AsyncSubject();

    componentDestruction = new Subject<any>();

    /**
     * Tracks the given value and disposes of it when the object gets destroyed
     */
    set tracked(track: Object) {

        if (track instanceof Subscription) {
            this.__disposables.push({
                track,
                dispose: "unsubscribe"
            });
            return;
        }

        if (typeof track["destroy"] === "function") {
            this.__disposables.push({
                track,
                dispose: "destroy"
            });
            return;
        }

        if (typeof track["dispose"] === "function") {
            this.__disposables.push({
                track,
                dispose: "dispose"
            });
            return;
        }

        throw new Error("Could not find a method that would destroy an object");
    }

    track(obj: Object) {
        this.tracked = obj;
    }

    ngOnDestroy(): void {
        this.componentDestruction.next(this);
        this.componentDestruction.complete();
        this.__disposables.forEach(d => d.track[d.dispose]());
    }



    ngAfterViewInit() {
        this.viewReady.next(true);
        this.viewReady.complete();
    }
}
