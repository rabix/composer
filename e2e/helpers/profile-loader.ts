import {browser} from "protractor";
import {LocalRepository} from "../../electron/src/storage/types/local-repository";

export class ProfileLoader {

    static async patchLocal(profile: Partial<LocalRepository>) {

        const serializedProfile = JSON.stringify(profile);

        return browser.executeAsyncScript(function (profile, callback) {
            window["require"]("electron").remote.getGlobal("__endpoints").patchLocalRepository(JSON.parse(profile), () => {
                callback("done");
            });
        }, serializedProfile);
    }
}
