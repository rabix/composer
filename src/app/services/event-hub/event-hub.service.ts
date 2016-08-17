import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs/Rx";

export interface AppEventAction {
    type: string,
    payload: any
}

export interface AppEventResponse {
    action?: AppEventAction;
    response?: any
    error?: AppErrorEvent,
    message?: string
}

export class AppErrorEvent {
    code: string | number;
    message: string;
    data: any;
}

interface SourceInterceptor<T> {
    (source: any): Observable<T>;
}

@Injectable()
export class EventHubService {

    private eventStream: Subject<AppEventAction>;
    private responses: Subject<AppEventResponse>;

    constructor() {
        this.eventStream = new Subject<AppEventAction>();
        this.responses   = new Subject<AppEventResponse>();

    }

    public publish(action: AppEventAction) {
        this.eventStream.next(action);
        return {
            getResponse: () => {
                return this.responses
                    .filter(ev => ev.action === action)
                    .flatMap(ev => {
                        const msg = ev.message || ev.error || "A mysterious error crossed our paths.";
                        console.debug("Should return an error", msg, ev);
                        return ev.error ? Observable.throw(msg) : Observable.of(ev.response)
                    })
                    .first();
            }
        }
    }

    public getStream(): Observable<AppEventAction> {
        return this.eventStream.asObservable();
    }

    public onValueFrom(actionType: Function): Observable<any> {
        return this.on(actionType).map(ev => ev.payload);
    }

    public on(actionType: Function): Observable<any> {
        return this.eventStream.filter(ev => {
            return ev instanceof actionType;
        });
    }

    public respond(ev: AppEventResponse) {
        this.responses.next(ev);
    }

    public intercept<T>(action): SourceInterceptor<T>{
        return source => {
            return source.catch(error => {
                this.respond({action, error});
                return Observable.empty();
            }).do(response => {
                this.respond({action, response});
            });
        }
    }
}
