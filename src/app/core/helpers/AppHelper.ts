export class AppHelper {
    static isLocal(appID: string): boolean {

        const isUnixPath    = appID.startsWith("/");
        const isWindowsPath = (/^[a-z]:\\.+$/i).test(appID);

        return isUnixPath || isWindowsPath;
    }

    static getRevisionlessID(appID: string): string {
        return appID.split("/").slice(0, 3).join("/");
    }
}
