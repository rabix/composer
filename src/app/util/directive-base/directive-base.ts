import {OnDestroy} from "@angular/core";
import {AsyncSubject} from "rxjs/AsyncSubject";
import {Subscription} from "rxjs/Subscription";

export abstract class DirectiveBase implements OnDestroy {

    /**
     * Holds the subscriptions that need to be disposed when the component gets removed.
     */
    private __disposables: { dispose: string, track: Object }[] = [];

    public viewReady = new AsyncSubject();

    /**
     * Tracks the given value and disposes of it when the object gets destroyed
     */
    public set tracked(track: Object) {

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

    ngOnDestroy(): void {
        this.__disposables.forEach(d => d.track[d.dispose]());
    }

    ngAfterViewInit() {
        this.viewReady.next(true);
        this.viewReady.complete();

    }
}
