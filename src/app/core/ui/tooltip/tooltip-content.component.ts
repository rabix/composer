import {Component, Input, AfterViewInit, ElementRef, ChangeDetectorRef, HostBinding, ViewChild} from "@angular/core";

require("./tooltip-content.component.scss");

@Component({
    selector: "ct-tooltip-content",
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
                <ng-content></ng-content>
                {{ content }}
            </div> 
        </div>
    `
})
export class TooltipContentComponent implements AfterViewInit {

    @Input()
    public hostElement: HTMLElement;

    @Input()
    public content: string;

    @Input()
    public placement: "top"|"bottom"|"left"|"right" = "bottom";

    @Input()
    public animation: boolean = false;

    @Input()
    public width: number;

    @Input()
    public height: number;

    @Input()
    public maxWidth = 200;

    @ViewChild("tooltipInner")
    private tooltipInner: ElementRef;

    @HostBinding("style.top.px")
    private top: number = -100000;

    @HostBinding("style.left.px")
    private left: number = -100000;

    @HostBinding("class.in")
    private isIn: boolean = false;

    @HostBinding("class.fade")
    private isFade: boolean = false;


    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

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

        const p = this.positionElements(this.hostElement, this.element.nativeElement.children[0], this.placement);

        this.top  = p.top;
        this.left = p.left;
        if (this.animation) {
            this.isFade = true;
        }

    }

    public hide(): void {
        this.top  = -100000;
        this.left = -100000;
        this.isIn = false;

        if (this.animation) {
            this.isFade = false;
        }
    }

    private positionElements(hostEl: HTMLElement, targetEl: HTMLElement, positionStr: string, appendToBody: boolean = false): { top: number, left: number } {
        let positionStrParts = positionStr.split("-");
        let pos0             = positionStrParts[0];
        let pos1             = positionStrParts[1] || "center";
        let hostElPos        = appendToBody ? this.offset(hostEl) : this.position(hostEl);
        let targetElWidth    = targetEl.offsetWidth;
        let targetElHeight   = targetEl.offsetHeight;
        let shiftWidth       = {
            center: function (): number {
                return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
            },
            left: function (): number {
                return hostElPos.left;
            },
            right: function (): number {
                return hostElPos.left + hostElPos.width;
            }
        };

        let shiftHeight = {
            center: function (): number {
                return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
            },
            top: function (): number {
                return hostElPos.top;
            },
            bottom: function (): number {
                return hostElPos.top + hostElPos.height;
            }
        };

        let targetElPos: { top: number, left: number };

        switch (pos0) {
            case "right":
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: shiftWidth[pos0]()
                };
                break;

            case "left":
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: hostElPos.left - targetElWidth
                };
                break;

            case "bottom":
                targetElPos = {
                    top: shiftHeight[pos0](),
                    left: shiftWidth[pos1]()
                };
                break;

            default:
                targetElPos = {
                    top: hostElPos.top - targetElHeight,
                    left: shiftWidth[pos1]()
                };
                break;
        }

        return targetElPos;
    }

    private position(nativeEl: HTMLElement): { width: number, height: number, top: number, left: number } {
        let offsetParentBCR  = {top: 0, left: 0};
        const elBCR          = this.offset(nativeEl);
        const offsetParentEl = this.parentOffsetEl(nativeEl);
        if (offsetParentEl !== window.document) {
            offsetParentBCR = this.offset(offsetParentEl);
            offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
            offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: elBCR.top - offsetParentBCR.top,
            left: elBCR.left - offsetParentBCR.left
        };
    }

    private offset(nativeEl: any): { width: number, height: number, top: number, left: number } {
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop),
            left: boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft)
        };
    }

    private getStyle(nativeEl: HTMLElement, cssProp: string): string {
        if ((nativeEl as any).currentStyle) {
            return (nativeEl as any).currentStyle[cssProp];
        } // IE

        if (window.getComputedStyle) {
            return (window.getComputedStyle(nativeEl) as any)[cssProp];
        }

        return (nativeEl.style as any)[cssProp];
    }

    private isStaticPositioned(nativeEl: HTMLElement): boolean {
        return (this.getStyle(nativeEl, "position") || "static" ) === "static";
    }

    private parentOffsetEl(nativeEl: HTMLElement): any {
        let offsetParent: any = nativeEl.offsetParent || window.document;
        while (offsetParent && offsetParent !== window.document && this.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || window.document;
    }

}