import {Directive, ElementRef, Input, OnInit} from "@angular/core";
import {DomEventService} from "../../../services/dom/dom-event.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/takeUntil";

@Directive({selector: "[ct-drag-over]"})
export class DragOverDirective extends DirectiveBase implements OnInit {

    @Input("ct-drag-over") set d(enabled: boolean) {
        if (enabled) {
            this.el.setAttribute("ct-drag-over", "");
        } else {
            this.el.removeAttribute("ct-drag-over");
        }
    }

    public el: Element;

    constructor(el: ElementRef, private domEvents: DomEventService) {
        super();
        this.el = el.nativeElement;
    }

    ngOnInit() {
        this.tracked = this.dragOver().subscribe(() => {
            this.domEvents.triggerCustomEventOnElements([this.el], this.domEvents.ON_DRAG_OVER_EVENT);
        });
    }

    private dragOver() {
        const dragEnter = Observable.fromEvent(this.el, this.domEvents.ON_DRAG_ENTER_EVENT);
        const dragLeave = Observable.fromEvent(this.el, this.domEvents.ON_DRAG_LEAVE_EVENT);

        return dragEnter.flatMap(md => Observable.of(md).delay(500).takeUntil(dragLeave));
    }
}
