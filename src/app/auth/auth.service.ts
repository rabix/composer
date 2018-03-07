import {Inject, Injectable, InjectionToken} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {CredentialsRegistry} from "./credentials-registry";
import {AuthCredentials} from "./model/auth-credentials";
import {combineLatest} from "rxjs/observable/combineLatest";
import {distinctUntilChanged, take} from "rxjs/operators";

export const CredentialsRegistryToken = new InjectionToken<CredentialsRegistry>("auth.credentials-registry");

@Injectable()
export class AuthService {

    private active = new ReplaySubject<AuthCredentials>(1);

    constructor(@Inject(CredentialsRegistryToken) private registry: CredentialsRegistry) {

        combineLatest(
            this.registry.getCredentials(),
            this.registry.getActiveCredentials(),
            (all, active) => {
                if (!active) {
                    return undefined;
                }

                return all.find(c => c.equals(active));
            }
        ).pipe(
            distinctUntilChanged((a, b) => a ? a.equals(b) : (a === b))
        ).subscribe(this.active);
    }

    getActive(): ReplaySubject<AuthCredentials | undefined> {
        return this.active;
    }

    getCredentials() {
        return this.registry.getCredentials();
    }

    /**
     * Sets an AuthCredentials instance as an active one
     * @returns {Observable<any>} Observable that completes when the activation is completed
     */
    setActiveCredentials(credentials?: AuthCredentials): Promise<any> {

        if (!credentials) {
            return this.registry.setActiveCredentials(undefined);
        }

        return this.getCredentials().pipe(take(1)).toPromise().then(all => {
            const val = all.find(c => c.equals(credentials));

            if (!val) {
                throw new Error("Could not activate an unregistered credentials set");
            }

            return this.registry.setActiveCredentials(val);
        });
    }

    /**
     * Add {@link AuthCredentials}. If credentials for the same username and platform exist, it will be updated.
     * Otherwise, new one will be added.
     *
     * @param {AuthCredentials} addedCredentials Credentials for inserting or matching a similar one for patching
     * @returns {Promise<any>} Promise of credentials update call
     */
    addCredentials(addedCredentials: AuthCredentials): Promise<any> {

        // Take up-to-date credentials array as a promise
        const currentCredentials = this.getCredentials().pipe(take(1)).toPromise();

        return currentCredentials.then(current => {

            // Try to find an existing credentials entry that is similar to the one added
            const similar = current.find(c => c.equals(addedCredentials));

            // If there is a similar entry, update that one
            if (similar) {
                similar.updateToMatch(addedCredentials);
                return this.registry.setCredentials(current);
            }

            // Otherwise, append given credentials
            const updatedCredentials = current.concat(addedCredentials);

            return this.registry.setCredentials(updatedCredentials);
        });
    }

    removeCredentials(credentials: AuthCredentials): Promise<any> {

        return this.getCredentials().pipe(take(1)).toPromise().then(current => {
            const index = current.findIndex(c => c.equals(credentials));

            if (index !== -1) {
                const updated = current.slice(0, index).concat(current.slice(index + 1));
                return this.registry.setCredentials(updated);
            }

            return Promise.resolve();
        });
    }
}
