import {Pipe, PipeTransform} from "@angular/core";
import {Expression} from "cwlts/mappings/d2sb/Expression";

@Pipe({
    name: "fileDefContent"
})

export class FileDefContentPipe implements PipeTransform {
    transform(value: string | Expression, args: any[]): any {

        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            const lines = value.split("\n").length + 1;
            return `${lines} lines, literal`;
        }

        const lines = value.script.split("\n").length + 1;
        return `${lines} lines, expression`;
    }
}