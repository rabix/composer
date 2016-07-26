export type CwlFileTemplateType = "blank" | "workflow" | "command_line_tool" | "js_expression" | string;
export type CwlFileTemplateVersion = "draft-2" | "v1.0";

export class FileTemplate {
    protected id: string;
}

export class CwlFileTemplate extends FileTemplate {

    public readonly cwlVersion: CwlFileTemplateVersion;
    public readonly type: CwlFileTemplateType;
    public readonly params: Object;

    constructor(type?: CwlFileTemplateType, cwlVersion?: CwlFileTemplateVersion, params = {}) {
        super();

        this.cwlVersion = cwlVersion || "v1.0";
        this.type       = type || "blank";
        this.params     = params;

        // Blank type will be unversioned, but the others shouldn't be
        this.id = this.type === "blank" ? "blank" : `${this.cwlVersion}_${this.type}`;
    }
}
