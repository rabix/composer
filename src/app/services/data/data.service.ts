import {Injectable, Inject} from "@angular/core";
import {Subject, Observable} from "rxjs/Rx";
import {DataRequest, DataResponse} from "./data.types";
import {BACKEND_SERVICE, BackendService} from "./providers/data.types";

/**
 * @TODO(ivanb) Make DataNotification be like DataResponse without the request
 */
@Injectable()
export class DataService {

    /** A downstream of all new information that's relevand to the app */
    private datastream: Subject<any>;

    constructor(@Inject(BACKEND_SERVICE)
                private backend: BackendService) {

        this.datastream = new Subject<any>();
        this.backend.dataStream().subscribe(this.datastream);

    }

    public getDataStream(): Observable<DataResponse> {
        return this.datastream;
    }

    public request(dataRequest: DataRequest): void {
        this.backend.send(dataRequest);
    }
}
