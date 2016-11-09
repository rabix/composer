import {Subscription} from "rxjs";
import {OnDestroy} from "@angular/core";

export abstract class ComponentBase implements OnDestroy {

    /**
     * Holds the subscriptions that need to be disposed when the component gets removed.
     */
    private __disposables: {dispose: string, track: Object}[] = [];

    /**
     * Tracks the given value and disposes of it when the object gets destroyed
     */
    public set tracked(track: Object) {

        if (track instanceof Subscription) {
            return this.__disposables.push({
                track,
                dispose: "unsubscribe"
            });
        }

        if (typeof track["destroy"] === "function") {
            return this.__disposables.push({
                track,
                dispose: "destroy"
            });
        }

        if (typeof track["dispose"] === "function") {
            return this.__disposables.push({
                track,
                dispose: "dispose"
            });
        }

        throw new Error("Could not find a method that would destroy an object");
    }

    ngOnDestroy(): void {
        this.__disposables.forEach(d => d.track[d.dispose]());
    }
}