import {Pipe, PipeTransform} from "@angular/core";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";

@Pipe({name: "commandOutputGlob", pure: false})
export class CommandOutputGlobPipe implements PipeTransform {
    transform(glob): any {

        if (!glob) {
            return "n/a";
        }

        if (glob instanceof SBDraft2ExpressionModel) {
            return glob.toString();
        }

        return glob;
    }

}
