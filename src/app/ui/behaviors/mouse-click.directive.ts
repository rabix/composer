import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {DomEventService} from "../../services/dom/dom-event.service";

@Directive({
    selector: "[ct-click]"
})
export class MouseClickDirective extends DirectiveBase implements OnInit {
    @Output("onMouseClick")
    clickEvent: EventEmitter<any> = new EventEmitter();

    public el: Element;

    constructor(el: ElementRef, private domEvents: DomEventService) {
        super();
        this.el = el.nativeElement;
    }

    ngOnInit() {
        this.tracked = this.domEvents.onMouseClick(this.el).subscribe((e: MouseEvent) => {
            this.clickEvent.emit(e);
        });
    }
}
