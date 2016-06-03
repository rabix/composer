import Socket = SocketIOClient.Socket;
import {AppConfig, APP_CONFIG} from "../../../../config/app.config";
import {BackendService} from "../data.types";
import {Inject, Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DataRequest, DataResponse} from "../../data.types";
import {Subject} from "rxjs/Rx";

@Injectable()
export class SocketService implements BackendService {

    /** Holds the websocket connection */
    private io: SocketIOClient.Socket;

    /** Incoming data */
    private emits: Subject<any>;

    constructor(@Inject(APP_CONFIG)
                private config: AppConfig) {

        this.io    = io(`http://${config.hostname}:${config.port}`);
        this.emits = new Subject<any>();
    }

    /**
     * Dispatches a DataRequest object to the backend server
     * @param request DataRequest
     */
    public send(request: DataRequest): void {
        this.request(request.getMethodName(), request.getData())
            .subscribe((response)=> {
                this.emits.next(new DataResponse(response, request));
            });
    }

    /**
     * Returns the observable that emits all messages that are coming in from the server
     * @returns {Observable<DataResponse>}
     */
    public dataStream(): Observable<DataResponse> {
        return this.emits.share();
    }

    /**
     * Sends a http/websocket message to the server.
     * @param eventName Name of the socket event that the server expects (HapiJS name)
     * @param data arbitrary data to send
     */
    private request(eventName: string, data: any = {}){
        this.io.emit(eventName, data, (data)=> {
            if (data.error) {
                this.emits.error(data);
                return;
            }

            this.emits.next(data);
        });
    }
}
