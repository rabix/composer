import {Injectable} from "@angular/core";

@Injectable()
export class AppGeneratorService {

    constructor() {
    }

    static generate(version: "d2sb" | "v1.0", type: "CommandLineTool" | "Workflow", id: string, label: string): Object {
        const app: any = {
            $namespaces: {
              sbg: "https://www.sevenbridges.com"
            },
            id,
            label,
            description: "",
            class: type,
            cwlVersion: version === "d2sb" ? "sbg:draft-2" : version
        };


        if (type === "CommandLineTool") {
            app.inputs      = [];
            app.outputs     = [];
            app.baseCommand = "";
        }
        if (type === "Workflow") {
            app.inputs  = [];
            app.outputs = [];
            app.steps   = [];
        }

        if (version !== "d2sb") {
            delete app["description"];
            app["doc"] = "";
        }

        return app;
    }

}
