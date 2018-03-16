export class AppHelper {
    static DS = navigator.platform.startsWith("Win") ? "\\" : "/";

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
        return appID.split("/").slice(0, 3).join("/");
    }

    static getAppIDWithRevision(id: string, revision: string);
    static getAppIDWithRevision(id: string, revision: number);
    static getAppIDWithRevision(id: string, revision: any | null): string {
        const revisionless = id.split("/").slice(0, 3).join("/");
        if (revision === null) {
            return revisionless;
        }

        return revisionless + "/" + revision.toString();
    }

    static getBasename(path: string, stripExtension = false): string {
        let lastPathPart = path.split("/").pop();

        if (AppHelper.isLocal(path)) {
            lastPathPart = path.split(AppHelper.DS).pop();
        }

        if (stripExtension) {
            const split = lastPathPart.split(".");
            if (split.length > 1) {
                return split.slice(0, -1).join(".");
            }

            return split.join(".");
        }

        return lastPathPart;
    }

    static endsWithAppExtension(path: string): string | false {
        const appExtensions = [".cwl", ".json", ".yml", ".yaml"];

        for (let i = 0; i < appExtensions.length; i++) {
            if (path.endsWith(appExtensions[i])) {
                return appExtensions[i];
            }
        }

        return false;
    }

    static getDirname(filepath: string): string {
        if (AppHelper.isLocal(filepath)) {
            return filepath.split(AppHelper.DS).slice(0, -1).join(AppHelper.DS);
        }

        return filepath.split("/").slice(0, -1).join("/");
    }

    static getRevision(appID: string): number | null {
        const parts = appID.split("/");
        if (parts.length !== 4) {
            return null;
        }

        const numeric = parseInt(parts.pop());
        if (isNaN(numeric)) {
            return null;
        }

        return numeric;
    }
}
