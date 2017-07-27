export class AppHelper {
    static DS: "/";

    static isLocal(appID: string): boolean {

        const isUnixPath    = appID.startsWith("/");
        const isWindowsPath = (/^[a-z]:\\.+$/i).test(appID);

        return isUnixPath || isWindowsPath;
    }

    static getRevisionlessID(appID: string): string {
        return appID.split(AppHelper.DS).slice(0, 3).join(AppHelper.DS);
    }

    static getBasename(path: string): string {
        const split = path.split(AppHelper.DS);
        return split[split.length - 1].split(".")[0];
    }
}
