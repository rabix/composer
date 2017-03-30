import {Injectable} from "@angular/core";

@Injectable()
export class AppGeneratorService {

    constructor() {
    }

    static generate(version: "d2sb" | "v1.0", type: "tool" | "workflow", id: string, label: string): Object {
        const app: any = {
            id,
            label,
            description: "",
            class: type === "workflow" ? "Workflow" : "CommandLineTool",
            cwlVersion: version === "d2sb" ? "draft-2" : version
        };


        if (type === "tool") {
            app.inputs      = [];
            app.outputs     = [];
            app.baseCommand = "";
        }
        if (type === "workflow") {
            app.inputs  = [];
            app.outputs = [];
            app.steps   = [];
        }

        return app;
    }

}
