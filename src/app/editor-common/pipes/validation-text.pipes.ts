import {Pipe, PipeTransform} from "@angular/core";
import {ValidationError} from "cwlts/models/helpers/validation";

@Pipe({
    name: "validationText"
})

export class ValidationTextPipe implements PipeTransform {
    transform(value: ValidationError[], args: any[]): any {

        if (Array.isArray(value)) {
            return value.map(err => err.message).join("\n");
        }

        return value || "";
    }
}
