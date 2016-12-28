import {Pipe, PipeTransform} from "@angular/core";
import {ExpressionModel} from "cwlts/models/d2sb";
import {Expression} from "../../../../node_modules/cwlts/mappings/d2sb/Expression";

@Pipe({
    name: "fileDefContent"
})

export class FileDefContentPipe implements PipeTransform {
    transform(value: ExpressionModel, args: any[]): any {

        if (!value) {
            return "";
        }

        if (value instanceof ExpressionModel) {
            const serialized = value.serialize();
            if (serialized === undefined) return "";

            if ((serialized as Expression).script) {
                const lines = (serialized as Expression).script.split("\n").length + 1;
                return `${lines} lines, expression`;
            }

            if (typeof serialized === "string") {
                const lines = serialized.split("\n").length + 1;
                return `${lines} lines, literal`;
            }
        }
    }
}