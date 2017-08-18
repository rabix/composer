import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {PlatformConnectionInfo} from "./platform-connection-info";


@Injectable()
export class PlatformConnectionService {

    credentials: BehaviorSubject<{ [hash: string]: PlatformConnectionInfo }> = new BehaviorSubject({});

    update: Subject<PlatformConnectionInfo> = new Subject();
    create: Subject<PlatformConnectionInfo> = new Subject();
    delete: Subject<PlatformConnectionInfo> = new Subject();



    constructor() {

    }



}
