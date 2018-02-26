import {Directive, ElementRef, Input} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Directive({selector: "[ct-drop-zones]"})
export class DropZones extends DirectiveBase {

    @Input("ct-drop-zones")
    set dropZones(zones: string[]) {
        this.el.setAttribute("ct-drop-zones", (zones || []).toString());
    }

    el: Element;

    constructor(el: ElementRef) {
        super();
        this.el = el.nativeElement;
    }
}
