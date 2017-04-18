import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "commandInputBinding"})
export class CommandInputBindingPipe implements PipeTransform {
    transform(inputBinding): any {

        if (!inputBinding) {
            return "unbound";
        }

        if (inputBinding.prefix) {
            return inputBinding.prefix;
        }

        if (inputBinding.position) {
            return `pos: ${inputBinding.position}`;
        }

        return "pos: 0";
    }

}
