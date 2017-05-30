import {Pipe, PipeTransform} from "@angular/core";
import {ExpressionModel} from "cwlts/models";

@Pipe({name: "commandOutputGlob", pure: false})
export class CommandOutputGlobPipe implements PipeTransform {
    transform(glob): any {

        if (glob instanceof ExpressionModel) {
            if (glob.serialize() === undefined) {
                return "n/a";
            }
            return glob.toString();
        }

        return "n/a";
    }
}
