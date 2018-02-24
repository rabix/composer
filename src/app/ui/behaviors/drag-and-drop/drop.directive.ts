import {Directive, ElementRef, Input} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Directive({selector: "[ct-drop-enabled]"})
export class DropDirective extends DirectiveBase {

    @Input("ct-drop-enabled") set dropEnabled(enabled: boolean) {
        if (enabled) {
            this.el.setAttribute("ct-drop-enabled", "");
        } else {
            this.el.removeAttribute("ct-drop-enabled");
        }
    }

    el: Element;

    constructor(el: ElementRef) {
        super();
        this.el = el.nativeElement;
    }
}
