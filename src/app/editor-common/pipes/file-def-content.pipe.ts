import {Pipe, PipeTransform} from "@angular/core";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";
import {Expression} from "cwlts/mappings/d2sb/Expression";

@Pipe({
    name: "fileDefContent"
})

export class FileDefContentPipe implements PipeTransform {
    transform(value: SBDraft2ExpressionModel, args: any[]): any {

        if (!value) {
            return "";
        }

        if (value instanceof SBDraft2ExpressionModel) {
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
