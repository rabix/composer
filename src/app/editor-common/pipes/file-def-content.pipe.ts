import {Pipe, PipeTransform} from "@angular/core";
import {ExpressionModel} from "cwlts/models";

@Pipe({ name: "fileDefContent", pure: false })
export class FileDefContentPipe implements PipeTransform {
    transform(value: ExpressionModel, args: any[]): any {

        if (!value) {
            return "";
        }

        if (value instanceof ExpressionModel) {
            const serialized = value.serialize();
            if (serialized === undefined) {
                return "";
            }

            const str  = value.toString();
            const type = value.isExpression ? "expression" : "literal";

            const lines = str.split("\n").length + 1;
            return `${lines} lines, ${type}`;
        }
    }
}
