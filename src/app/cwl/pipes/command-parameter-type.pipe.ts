import {Pipe, PipeTransform} from "@angular/core";
import {TypeResolver} from "cwlts/models/helpers";

@Pipe({name: "commandParameterType"})
export class CommandParameterTypePipe implements PipeTransform {
    transform(type): any {

        try {
            let output     = type.type;

            if (type.type === "array") {
                output = `Array<${type.items}>`;
            }

            return output + (type.isNullable ? "?" : "");
        } catch (ex) {
            return "n/a";
        }
    }

}