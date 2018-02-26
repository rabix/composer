import {Directive, ElementRef, EventEmitter, OnInit, Output} from "@angular/core";
import {DomEventService} from "../../services/dom/dom-event.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Directive({
    selector: "[ct-click]"
})
export class MouseClickDirective extends DirectiveBase implements OnInit {
    @Output("onMouseClick")
    clickEvent: EventEmitter<any> = new EventEmitter();

    el: Element;

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
