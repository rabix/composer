import {Pipe, PipeTransform} from "@angular/core";
import {TypeResolver} from "cwlts/models/helpers";

@Pipe({name: "commandParameterType"})
export class CommandParameterTypePipe implements PipeTransform {
    transform(type): any {

        try {
            const resolved = TypeResolver.resolveType(type);
            let output     = resolved.type;

            if (resolved.type === "array") {
                output = `Array<${resolved.items}>`;
            }

            return output + (resolved.isRequired ? "" : "?");
        } catch (ex) {
            return "n/a";
        }
    }

}