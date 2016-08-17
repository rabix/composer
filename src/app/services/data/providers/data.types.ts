import {DataRequest, DataResponse} from "../data.types";
import {Observable} from "rxjs/Rx";
import {OpaqueToken} from "@angular/core";

export interface BackendService {
    send(request: DataRequest): void;
    dataStream(): Observable<DataResponse>;
}

export let BACKEND_SERVICE = new OpaqueToken("BackendService");

