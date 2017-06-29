import {Injectable} from "@angular/core";

import "rxjs/add/operator/mergeMap";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {CredentialsEntry} from "../../services/storage/user-preferences-types";

@Injectable()
export class OldAuthService {

    connections = new ReplaySubject<any[]>(1);

    credentials: Map<string, CredentialsEntry> = new Map();

    credentialsChange: ReplaySubject<Map<string, CredentialsEntry>> = new ReplaySubject();

    constructor() {



        this.credentialsChange.next(this.credentials);

    }
}
