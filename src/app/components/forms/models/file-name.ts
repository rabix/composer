/**
 * Represents a plain file path with convenience operations that can be done on it
 */
export class FileName {

    /** Fully qualified path of the file, eg. "/root/var/hello.txt" */
    public readonly fullPath: string;

    /** Directory part of the path, eg. "/root/var" */
    public readonly dir: string;

    /** Base file name, eg. "hello.txt" */
    public readonly baseName: string;

    /** Base name without extension, eg. "hello" */
    public readonly baseNameWithoutExtension: string;

    /** Extension part of the file, eg. "txt" */
    public readonly extension: string;

    /** Check whether the path is defined as an absolute one */
    public readonly isAbsolute: string;

    constructor(fullPath: string) {
        this.fullPath                 = fullPath;
        [, this.extension = ""]       = this.fullPath.split(/\.(?=[a-z0-9]*$)/gi);
        this.isAbsolute               = this.fullPath.charAt(0) === "/";
        this.dir                      = this.fullPath.substr(0, this.fullPath.lastIndexOf("/") + 1);
        this.baseName                 = this.fullPath.substr(this.dir.length);
        this.baseNameWithoutExtension = this.baseName.substr(0, this.baseName.indexOf(this.extension) - 1);
    }

    /**
     * Replace an extension on the file name, or add it if the name has no extension
     */
    public changeExtension(ext: string): FileName {
        if (this.extension === ext) {
            return this;
        }
        const extension = ext.charAt(0) === "." ? ext : `.${ext}`;

        if (!this.hasExtension()) {
            return this.ensureExtension(extension);
        }

        return new FileName(this.fullPath.substr(0, this.fullPath.lastIndexOf(this.extension) - 1) + extension);
    }

    /**
     * Create a FileName with an added extension
     */
    public ensureExtension(ext: string): FileName {
        if (this.extension === ext) {
            return this;
        }

        const extension = ext.charAt(0) === "." ? ext : `.${ext}`;
        return new FileName(this.fullPath + extension);
    }

    /**
     * Checks whether the file has extension or not
     */
    public hasExtension(): boolean {
        return this.extension !== "";
    }
}
