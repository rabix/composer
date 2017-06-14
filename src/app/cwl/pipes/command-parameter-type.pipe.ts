import {Pipe, PipeTransform} from "@angular/core";
import {ParameterTypeModel} from "cwlts/models";

/**
 * FIXME: make this pure -> {@link ToolInputListComponent.updateInput}
 */
@Pipe({name: "commandParameterType", pure: false})
export class CommandParameterTypePipe implements PipeTransform {
    transform(type: ParameterTypeModel): any {
        try {
            let output: string = type.type;
            const nullable = type.isNullable ? "?" : "";

            if (output === undefined) {
                return "n/a";
            }

            if (type.isItemOrArray) {
                return `${output}${nullable}, Array<${output}>${nullable}`
            }

            if (type.type === "array") {
                output = `Array<${type.items}>`;
            }

            return output + nullable;
        } catch (ex) {
            return "n/a";
        }
    }

}
