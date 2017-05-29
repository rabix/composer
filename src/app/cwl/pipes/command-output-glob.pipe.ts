import {Pipe, PipeTransform} from "@angular/core";
import {ExpressionModel} from "cwlts/models";

@Pipe({name: "commandOutputGlob", pure: false})
export class CommandOutputGlobPipe implements PipeTransform {
    transform(glob): any {

        if (!glob) {
            return "n/a";
        }

        if (glob instanceof ExpressionModel) {
            return glob.toString();
        }

        return glob;
    }
}
