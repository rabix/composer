import {Pipe, PipeTransform} from "@angular/core";
import {ExpressionModel} from "cwlts/models/d2sb";

@Pipe({name: "commandOutputGlob"})
export class CommandOutputGlobPipe implements PipeTransform {
    transform(glob): any {

        if(!glob){
            return "n/a";
        }

        if (glob instanceof ExpressionModel) {
            return glob.toString();
        }

        return glob;
    }

}
