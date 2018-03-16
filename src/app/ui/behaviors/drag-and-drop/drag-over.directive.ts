import {Directive, ElementRef, Input, OnInit} from "@angular/core";
import {DomEventService} from "../../../services/dom/dom-event.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {fromEvent} from "rxjs/observable/fromEvent";
import {flatMap, delay, takeUntil} from "rxjs/operators";
import {of} from "rxjs/observable/of";

@Directive({selector: "[ct-drag-over]"})
export class DragOverDirective extends DirectiveBase implements OnInit {

    @Input("ct-drag-over") set d(enabled: boolean) {
        if (enabled) {
            this.el.setAttribute("ct-drag-over", "");
        } else {
            this.el.removeAttribute("ct-drag-over");
        }
    }

    el: Element;

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
        const dragEnter = fromEvent(this.el, this.domEvents.ON_DRAG_ENTER_EVENT);
        const dragLeave = fromEvent(this.el, this.domEvents.ON_DRAG_LEAVE_EVENT);

        return dragEnter.pipe(
            flatMap(mouseDrag => of(mouseDrag).pipe(
                delay(500),
                takeUntil(dragLeave)
            ))
        );
    }
}
