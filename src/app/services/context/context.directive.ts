import {Directive, HostListener, ElementRef, Input} from "@angular/core";
import {ContextService} from "./context.service";
import {MenuItem} from "../../components/menu/menu-item";
@Directive({
    selector: "[ct-context]"
})
export class ContextDirective {

    @Input("ct-context")
    private contextMenuItems: MenuItem[];

    /** Native element that holds the directive */
    private el: HTMLElement;

    constructor(el: ElementRef, private context: ContextService) {
        this.el = el.nativeElement;
    }

    @HostListener("contextmenu", ["$event"])
    private onRightClick(event: MouseEvent) {
        event.preventDefault();

        this.context.showAt(this.contextMenuItems, {x: event.clientX, y: event.clientY});
    }
}
