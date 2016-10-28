export type CwlFileTemplateType = "blank" | "workflow" | "command_line_tool" | string;
export type CwlFileTemplateVersion = "draft-2" | "v1.0";

export class FileTemplate {
    protected id: string;
}

export class CwlFileTemplate extends FileTemplate {

    public readonly id: string;
    public readonly cwlVersion: CwlFileTemplateVersion;
    public readonly type: CwlFileTemplateType;
    public readonly params: Object;

    constructor(type?: CwlFileTemplateType, cwlVersion?: CwlFileTemplateVersion, params = {}) {
        super();

        this.cwlVersion = cwlVersion || "v1.0";
        this.type       = type || "blank";
        this.params     = params;

        this.params["id"] = this.makeID(this.params["label"]);

        // Blank type will be unversioned, but the others shouldn't be
        this.id = "blank";
        if (this.type !== "blank") {
            this.id = this.cwlVersion + "-" + this.type;
        }
    }

    private makeID(str) {
        str = str.replace(/([a-z])([A-Z])/g, '$1-$2');
        str = str.replace(/[ \t\W]/g, '-');
        str = str.replace(/^-+|-+$/g, '');
        return str.toLowerCase();
    }

}
