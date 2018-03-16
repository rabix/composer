import {of as ObservableOf} from "rxjs/observable/of";
import {AuthService} from "./auth.service";
import {AuthCredentials} from "./model/auth-credentials";

describe("AuthService", () => {

    it("should submit a new set of credentials if a similar one does not exist", function (done) {

        const registry = {
            getCredentials: () => ObservableOf([]),
            getActiveCredentials: () => ObservableOf(null),
            setCredentials: () => Promise.resolve(),
            setActiveCredentials: () => Promise.resolve()
        };

        const creds = AuthCredentials.from({
            token: "token",
            url: "https://api.sbgenomics.com",
            user: {username: "testuser"} as any,
            id: "api_testuser"
        });

        const auth  = new AuthService(registry);

        const setCredentialsSpy = spyOn(registry, "setCredentials").and.returnValue(Promise.resolve());

        auth.addCredentials(creds).then(() => {

            expect(setCredentialsSpy.calls.count()).toEqual(1);
            expect(setCredentialsSpy.calls.argsFor(0)[0][0]).toEqual(creds);

            done();
        });

    });

    it("should submit a new set of credentials if a similar one exist", function (done) {

        const registry = {
            getCredentials: () => ObservableOf([
                new AuthCredentials("https://api.sbgenomics.com", "originalToken", {username: "testuser"} as any)
            ]),
            getActiveCredentials: () => ObservableOf(null),
            setCredentials: () => Promise.resolve(),
            setActiveCredentials: () => Promise.resolve()
        };

        const creds = AuthCredentials.from({
            token: "updatedToken",
            url: "https://api.sbgenomics.com",
            user: {username: "testuser"} as any,
            id: "api_testuser"
        });

        const auth  = new AuthService(registry);
        const setCredentialsSpy = spyOn(registry, "setCredentials").and.returnValue(Promise.resolve());

        auth.addCredentials(creds).then(() => {

            expect(setCredentialsSpy.calls.argsFor(0)[0][0]).toEqual(creds);

            done();
        });

    });
});
