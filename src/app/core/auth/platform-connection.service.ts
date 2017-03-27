import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {GuidService} from "../../services/guid.service";
import {PlatformConnectionInfo} from "./platform-connection-info";


@Injectable()
export class PlatformConnectionService {

    credentials: BehaviorSubject<{ [hash: string]: PlatformConnectionInfo }> = new BehaviorSubject({});

    update: Subject<PlatformConnectionInfo> = new Subject();
    create: Subject<PlatformConnectionInfo> = new Subject();
    delete: Subject<PlatformConnectionInfo> = new Subject();



    constructor(private http: Http, private guid: GuidService) {

    }

    public setCredentials(credentialSets: PlatformConnectionInfo[] = []) {

        const existingCredentials = this.credentials.getValue();
        credentialSets.forEach(set => {
            // const hash = PlatformConnectionService.hashUrlTokenPair(set.url, set.token);

            // const m
            // const match = existingCredentials.find(c => c.hash === hash);
            //
            // if (!match) {
            //     this.c
            // }
        });
    }


}
