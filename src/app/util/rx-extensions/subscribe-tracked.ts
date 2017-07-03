import {Observable} from "rxjs/Observable";
import {PartialObserver} from "rxjs/Observer";
import {Subscription} from "rxjs/Subscription";

declare module "rxjs/Observable" {
    interface Observable<T> {
        /**
         * Creates a subscription which is stored in a given tracker responsible for disposing it.
         */
        subscribeTracked: (tracker: { track: (obj: any) => any },
                           observerOrNext?: PartialObserver<T> | ((value: T) => void),
                           error?: (error: any) => void,
                           complete?: () => void) => Subscription
    }
}

Observable.prototype.subscribeTracked = function (tracker, ...rest) {

    const subscription = this.subscribe(...rest);

    if (tracker) {
        tracker.track(subscription);
    } else {
        throw new Error("Can't apply subscribeTracked to a context that is not a prototype of the DirectiveBase");
    }


    return subscription;
};
