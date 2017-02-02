import {Directive, ViewChildren} from "@angular/core";

@Directive({
    selector: "[ct-blur-clot]",
})
export class BlurClotDirective {

    @ViewChildren("input")
    private inputs;
}
