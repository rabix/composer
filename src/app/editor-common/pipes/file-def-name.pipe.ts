import {Pipe, PipeTransform} from "@angular/core";
import {Expression} from "cwlts/mappings/d2sb/Expression";

@Pipe({
    name: "fileDefName"
})

export class FileDefNamePipe implements PipeTransform {
    transform(value: string | Expression, args: any[]): any {

        if(typeof value === "object"){
            return value.script;
        }

        return value || "";
    }
}