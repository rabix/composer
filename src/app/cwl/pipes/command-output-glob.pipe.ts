import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "commandOutputGlob"})
export class CommandOutputGlobPipe implements PipeTransform {
    transform(glob): any {

        if(!glob){
            return "n/a";
        }

        if (typeof glob === "object") {
            return glob.script;
        }
        return glob;
    }

}