import {EventHubAction} from "../../action-events/index";
import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs/Rx";

export interface AppEventAction {
    type: string,
    payload: any
}

export interface AppEventResponse {
    action?: AppEventAction;
    response?: any
    error?: AppErrorEvent
}

export class AppErrorEvent {
    code: string | number;
    message: string;
    data: any;
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
                    .flatMap(ev => ev.error ? Observable.throw(ev.error) : Observable.of(ev.response));
            }
        }
    }

    public getStream(): Observable<AppEventAction> {
        return this.eventStream.asObservable();
    }

    public onValueFrom(actionType: EventHubAction): Observable<any> {
        return this.on(actionType).map(ev => ev.payload);
    }

    public on(actionType: EventHubAction): Observable<any> {
        return this.eventStream.filter(ev => {
            return ev instanceof actionType;
        });
    }

    public respond(ev: AppEventResponse) {
        this.responses.next(ev);
    }

    public intercept(action) {
        return (source) => {
            return source.catch(error => {
                this.respond({action, error});
                return Observable.empty();
            }).do(response => {
                this.respond({action, response});
            });
        }
    }
}
