/**
 * Represents a plain file path with convenience operations that can be done on it
 */
export class FileName {

    public readonly fullPath: string;

    public readonly dir: string;
    public readonly baseName: string;
    public readonly baseNameWithoutExtension: string;
    public readonly extension: string;
    public readonly isAbsolute: string;

    constructor(fullPath: string) {
        this.fullPath = fullPath;


        [, this.extension = ""]       = this.fullPath.split(/\.(?=[a-z0-9]*$)/gi);
        this.isAbsolute               = this.fullPath.charAt(0) === "/";
        this.dir                      = this.fullPath.substr(0, this.fullPath.lastIndexOf("/") + 1);
        this.baseName                 = this.fullPath.substr(this.dir.length);
        this.baseNameWithoutExtension = this.baseName.substr(0, this.baseName.indexOf(this.extension) - 1);
    }

    public withExtension(extension: string): FileName {
        const extension = extension.charAt(0) === "." ? extension : `.${extension}`;

        if (!this.hasExtension()) {
            return new FileName(this.fullPath + extension);
        }

        return new FileName(this.fullPath.substr(0, this.fullPath.lastIndexOf(this.extension)) + extension);
    }

    public hasExtension(): boolean {
        return this.extension !== "";
    }

    public toString() {
        return this.fullPath;
    }
}
