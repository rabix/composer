import {Pipe, PipeTransform} from "@angular/core";
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {ExpressionModel} from "cwlts/models/d2sb/ExpressionModel";

@Pipe({
    name: "fileDefName"
})

export class FileDefNamePipe implements PipeTransform {
    transform(value: string | Expression, args: any[]): any {

        if(value instanceof ExpressionModel){
            return value.toString();
        }

        return value || "";
    }
}