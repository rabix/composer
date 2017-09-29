import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {AuthCredentials} from "./model/auth-credentials";

@Injectable()
export class AuthService {

    private active = new ReplaySubject<AuthCredentials>(1);

    constructor(private repository: LocalRepositoryService) {

        Observable.combineLatest(
            this.repository.getCredentials(),
            this.repository.getActiveCredentials(),
            (all, active) => {
                if (!active) {
                    return undefined;
                }

                return all.find(c => c.equals(active));
            }
        ).subscribe(this.active);
    }

    getActive(): ReplaySubject<AuthCredentials | undefined> {
        return this.active;
    }

    getCredentials() {
        return this.repository.getCredentials();
    }

    /**
     * Sets an AuthCredentials instance as an active one
     * @returns {Observable<any>} Observable that completes when the activation is completed
     */
    setActiveCredentials(credentials?: AuthCredentials): Promise<any> {

        if (!credentials) {
            return this.repository.setActiveCredentials(undefined);
        }

        return this.getCredentials().take(1).toPromise().then(all => {
            const val = all.find(c => c.equals(credentials));

            if (!val) {
                throw new Error("Could not activate an unregistered credentials set");
            }

            return this.repository.setActiveCredentials(val);
        });
    }

    /**
     * Add {@link AuthCredentials}. If credentials for the same username and platform exist, it will be updated.
     * Otherwise, new one will be added.
     *
     * @param {AuthCredentials} credentials Credentials for inserting or matching a similar one for patching
     * @returns {Promise<any>} Promise of credentials update call
     */
    addCredentials(credentials: AuthCredentials): Promise<any> {

        // Take up-to-date credentials array as a promise
        const currentCredentials = this.getCredentials().take(1).toPromise();

        return currentCredentials.then(current => {

            // Try to find an existing credentials entry that is similar to the one added
            const similar = current.find(c => c.equals(credentials));

            // If there is a similar entry, update that one
            if (similar) {
                similar.updateToMatch(credentials);
                return Promise.resolve(null);
            }

            // Otherwise, append given credentials
            const updatedCredentials = current.concat(credentials);

            return this.repository.setCredentials(updatedCredentials);
        });
    }

    removeCredentials(credentials: AuthCredentials): Promise<any> {

        return this.getCredentials().take(1).toPromise().then(current => {
            const index = current.findIndex(c => c.equals(credentials));

            if (index !== -1) {
                const updated = current.slice(0, index).concat(current.slice(index + 1));
                return this.repository.setCredentials(updated);
            }

            return Promise.resolve();
        });
    }
}
