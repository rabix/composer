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
        this.top  = -10000;
        this.left = -10000;
        this.isIn = false;

        if (this.animation) {
            this.isFade = false;
        }
    }

    private positionElements(hostEl: HTMLElement, targetEl: HTMLElement) {

        const {left:hostLeft, top:hostTop}                             = hostEl.getBoundingClientRect();
        const {clientWidth: hostWidth, clientHeight: hostHeight}       = hostEl;
        const {clientWidth: contentWidth, clientHeight: contentHeight} = targetEl;

        const contentTop  = hostTop - contentHeight;
        const contentLeft = hostLeft - contentWidth / 2 + hostWidth / 2;

        return {top: contentTop, left: contentLeft};
    }

}