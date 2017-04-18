import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Observable} from "rxjs/Observable";
import {ErrorBarService} from "../../layout/error-bar/error-bar.service";
import {ConnectionState, CredentialsEntry} from "../../services/storage/user-preferences-types";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {PlatformAPI} from "../api/platform-api";


@Injectable()
export class AuthService {

    authenticationProgress = new BehaviorSubject(false);

    connections = new ReplaySubject<CredentialsEntry[]>(1);

    /**
     * Converts a https://*.sbgenomics.com url to a profile name
     */
    static urlToProfile(url) {
        const match = url.match("https:\/\/(.*?)\.sbgenomics\.com");
        if (Array.isArray(match) && match[1]) {
            const profile = match[1].toLowerCase();
            return profile === "igor" ? "default" : profile;
        }
        throw "Could not convert a non-sbg url to profile";
    }

    static hashUrlTokenPair(url: string, token: string) {
        const profile = AuthService.urlToProfile(url);
        return profile + "_" + token;
    }

    constructor(private prefs: UserPreferencesService,
                private errorBar: ErrorBarService,
                private http: Http) {
        this.invalidateConnections();

        this.prefs.getCredentials()
            .map(creds => creds.filter(c => c.status === ConnectionState.Connected && c.sessionID))
            .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)).subscribe(this.connections);

    }

    watchCredentials() {
        this.prefs.getCredentials()
            .distinctUntilChanged((a, b) => {
                const hashesA = a.map(c => c.hash).toString();
                const hashesB = b.map(c => c.hash).toString();
                return hashesA === hashesB;
            })
            .flatMap(creds => {
                const m = creds.map(c => ({
                    ...c,
                    status: ConnectionState.Connecting
                }));
                this.authenticationProgress.next(true);
                return this.prefs.setCredentials(m);
            })
            .flatMap(creds => {
                const checks = creds.map(c => {
                    const api = new PlatformAPI(this.http, c.url, c.token);
                    return api.openSession()
                        .flatMap(session => api.getUser(session), (session, user) => ({session, user}))
                        .timeout(10000)
                        .catch(err => {

                            let errorMessage = `Cannot connect to ${c.url}.`;
                            if (err.status === 0) {
                                errorMessage += "Platform doesn't exist on that URL.";
                            } else if (err.status === 504) {
                                errorMessage += " API has timed out.";
                            } else if (err instanceof Error) {
                                errorMessage += " " + err.message + ".";
                            } else if (err.status === 401) {
                                errorMessage += " Invalid token.";
                            }

                            this.errorBar.showError(errorMessage);
                            return Observable.of(err);
                        });
                });

                if (checks.length === 0) {
                    return Observable.of([]);
                }

                return Observable.forkJoin(...checks);
            }, (credentials, sessions) => ({credentials, sessions}))
            .subscribe(data => {
                this.authenticationProgress.next(false);
                const update = data.credentials.map((c, i) => {
                    const {session, user} = data.sessions[i] as any;
                    return {
                        ...c,
                        status: typeof session === "string" ? ConnectionState.Connected : ConnectionState.Disconnected,
                        sessionID: typeof session === "string" ? session : null,
                        user
                    };
                });
                this.prefs.setCredentials(update);

            }, err => {
                console.log("Error on watch", err);
            });
    }

    invalidateConnections() {


        return this.prefs.getCredentials().take(1).flatMap(creds => {
            const invalidated = creds.map(c => {
                return {
                    ...c,
                    status: ConnectionState.Disconnected,
                    sessionID: undefined
                };
            });
            return this.prefs.setCredentials(invalidated);

        });
    }
}
