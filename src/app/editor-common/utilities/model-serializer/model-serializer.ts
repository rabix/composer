import {CommandLineToolModel, WorkflowModel} from "cwlts/models";
import * as Yaml from "js-yaml";
import {DumpOptions} from "js-yaml";

export function serializeModel(model: CommandLineToolModel | WorkflowModel, embedReferences = true, asYaml = false, deleteSBGJob = false) {
    let obj;
    if (embedReferences && model instanceof WorkflowModel) {
        obj = model.serializeEmbedded();
    } else {
        obj = model.serialize();
    }

    if (deleteSBGJob) {
        delete obj["sbg:job"];
    }

    if (asYaml) {
        return Yaml.dump(obj, {
            json: true,
        } as DumpOptions);
    }

    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "string") {
            return value.replace(/\u2002/g, " ");
        }

        return value;
    }, 4);

}
