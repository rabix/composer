export class AppHelper {
    static DS = "/";

    static isLocal(appID: string): boolean {

        return AppHelper.isUnixPath(appID) || AppHelper.isWindowsPath(appID);
    }

    static isWindowsPath(appID: string) {
        return (/^[a-z]:\\.+$/i).test(appID);
    }

    static isUnixPath(appID: string) {
        return appID.startsWith("/");
    }

    static getRevisionlessID(appID: string): string {
        return appID.split(AppHelper.DS).slice(0, 3).join(AppHelper.DS);
    }

    static getBasename(path: string): string {
        const split = path.split(AppHelper.DS);
        return split[split.length - 1].split(".")[0];
    }

    static getDirname(path) {

        if (AppHelper.isWindowsPath(path)) {
            path.split("\\").slice(0, -1).join("\\");
        }

        return path.split("/").slice(0, -1).join("/");


    }
}
