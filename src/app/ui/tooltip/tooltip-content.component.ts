import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, Input, ViewChild, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tooltip-content",
    styleUrls: ["./tooltip-content.component.scss"],
    host: {
        "class": "tooltip",
        "[class]": "'tooltip-' + placement"
    },
    template: `
        <div class="tooltip tooltip-{{ placement }}"
             [style.top.px]="top"
             [style.left.px]="left"
             [class.in]="isIn"
             [class.fade]="isFade"
             role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner"
                 #tooltipInner
                 [style.maxWidth.px]="maxWidth"
                 [style.width.px]="width"
                 [style.height.px]="height">

                <!--If there is a component given, transclude it-->
                <ng-content></ng-content>

                <!--If it's a plain string, show it-->
                <span *ngIf="content" class="tooltip-inner-plaintext">{{ content }}</span>
            </div>
        </div>
    `
})
export class TooltipContentComponent implements AfterViewInit {

    @Input()
    hostElement: HTMLElement;

    @Input()
    content: string;

    @Input()
    placement: "top" | "bottom" | "left" | "right" = "bottom";

    @Input()
    animation = false;

    @Input()
    width;

    @Input()
    height: number;

    @Input()
    maxWidth = 300;

    @ViewChild("tooltipInner")
    private tooltipInner: ElementRef;

    @HostBinding("style.top.px")
    top = -100000;

    @HostBinding("style.left.px")
    left = -100000;

    @HostBinding("class.in")
    isIn = false;

    @HostBinding("class.fade")
    isFade = false;

    constructor(public element: ElementRef,
                private cdr: ChangeDetectorRef) {
    }

    ngAfterViewInit(): void {
        this.show();
        this.cdr.detectChanges();
    }

    public show(): void {
        if (!this.hostElement) {
            return;
        }
        this.isIn = true;

        if (this.animation) {
            this.isFade = true;
        }

        setTimeout(() => {
            const p = this.positionElements(this.hostElement, this.element.nativeElement.children[0]);

            this.top  = p.top;
            this.left = p.left;
            this.cdr.markForCheck();
        });

    }

    public hide(): void {

        // Timeout is needed because if this tooltip becomes shown and hidden in the same tick,
        // setTimeout from showing it will actually bring it back after it was hidden
        // so we need to ensure that these two get called in the correct order
        setTimeout(() => {
            this.top  = -10000;
            this.left = -10000;
            this.isIn = false;

            if (this.animation) {
                this.isFade = false;
            }
            this.cdr.markForCheck();
        });
    }

    private positionElements(hostEl: HTMLElement, targetEl: HTMLElement) {

        const {offsetWidth, offsetHeight} = document.body;

        const hostBBox   = hostEl.getBoundingClientRect();
        const targetBBox = targetEl.getBoundingClientRect();

        if (this.placement === "top") {
            const top = hostBBox.top - targetBBox.height;
            let left  = hostBBox.left - targetBBox.width / 2 + hostBBox.width / 2;

            if ((left + targetBBox.width) > offsetWidth) {
                left += offsetWidth - (left + targetBBox.width);
            } else if (left < 0) {
                left = 0;
            }

            return {top, left};
        } else if (this.placement === "bottom") {
            const top = hostBBox.bottom;
            let left  = hostBBox.left - targetBBox.width / 2 + hostBBox.width / 2;

            if ((left + targetBBox.width) > offsetWidth) {
                left += offsetWidth - (left + targetBBox.width);
            } else if (left < 0) {
                left = 0;
            }

            return {top, left};
        }
    }

}
