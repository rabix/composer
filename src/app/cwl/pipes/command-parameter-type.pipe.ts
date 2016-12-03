import {Pipe, PipeTransform} from "@angular/core";

/**
 * FIXME: make this pure -> {@link ToolInputListComponent.updateInput}
 */
@Pipe({name: "commandParameterType", pure: false})
export class CommandParameterTypePipe implements PipeTransform {
    transform(type): any {

        try {
            let output = type.type;

            if (type.type === "array") {
                output = `Array<${type.items}>`;
            }

            return output + (type.isNullable ? "?" : "");
        } catch (ex) {
            return "n/a";
        }
    }

}