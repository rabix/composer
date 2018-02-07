import {Observable} from "rxjs/Observable";
import {AuthCredentials} from "./model/auth-credentials";

export interface CredentialsRegistry {

    getCredentials(): Observable<AuthCredentials[]>;

    setCredentials(credentials: AuthCredentials[]): Promise<any>;

    getActiveCredentials(): Observable<AuthCredentials>;

    setActiveCredentials(credentials: AuthCredentials | null): Promise<any>;
}
