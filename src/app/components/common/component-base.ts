import {Subscription} from "rxjs";
import {OnDestroy} from "@angular/core";

export abstract class ComponentBase implements OnDestroy {

    /**
     * Holds the subscriptions that need to be disposed when the component gets removed.
     */
    private __subscriptions: Subscription[] = [];

    /**
     * Tracks the given value and disposes of it when the object gets destroyed
     */
    public set tracked(value: Subscription) {
        if (value instanceof Subscription) {
            this.__subscriptions.push(value);
        }
    }

    ngOnDestroy(): void {
        this.__subscriptions.forEach(sub => sub.unsubscribe());
    }
}