import {Component, ElementRef, HostBinding, ViewChild} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DomEventService} from "../../services/dom/dom-event.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {take, last, takeUntil, skip, withLatestFrom} from "rxjs/operators";

@Component({
    selector: "ct-editor-inspector",
    styleUrls: ["./editor-inspector.component.scss"],
    template: `
        <div class="resizer" #resizeHandle></div>
        <ng-content></ng-content>
    `
})
export class EditorInspectorComponent extends DirectiveBase {

    @HostBinding("style.flexBasis.px")
    flexBasis = 320;

    @ViewChild("resizeHandle")
    resizeHandle: ElementRef;

    /**
     * FIXME: Right bundle should not be less than 320 because components don't scale well
     */
    private resizeBoundaries = {left: 500, right: 320};

    constructor(private domEvents: DomEventService, private element: ElementRef) {
        super();
    }

    ngAfterViewInit() {
        this.attachResizeListener(this.resizeHandle.nativeElement);
    }


    private attachResizeListener(handle: HTMLElement) {
        const hostContainer = this.element.nativeElement.parentElement;

        this.domEvents.onDrag(handle).subscribeTracked(this, (movement: Observable<MouseEvent>) => {

            const initialWidth = this.flexBasis;

            const down = movement.pipe(take(1));
            const up   = movement.pipe(last(), take(1));
            const move = movement.pipe(skip(1), takeUntil(up));

            move.pipe(
                withLatestFrom(down, (outer, inner) => inner.clientX - outer.clientX)
            ).subscribeTracked(this, deltaX => {
                const update = initialWidth + deltaX;

                const isBeyondLeftMargin  = update > (hostContainer.clientWidth - this.resizeBoundaries.left);
                const isBeyondRightMargin = update < this.resizeBoundaries.right;

                if (!isBeyondLeftMargin && !isBeyondRightMargin) {
                    this.flexBasis = update;
                }

            });


        });
    }
}
