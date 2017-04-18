import {Pipe, PipeTransform} from "@angular/core";
import {ExpressionModel} from "cwlts/models";

@Pipe({
    name: "fileDefName",
    pure: false
})

export class FileDefNamePipe implements PipeTransform {
    transform(value: string | ExpressionModel, args: any[]): any {

        if (value instanceof ExpressionModel) {
            return value.toString();
        }

        return value || "";
    }
}
