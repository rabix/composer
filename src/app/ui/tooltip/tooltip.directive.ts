import {ComponentFactoryResolver, ComponentRef, Directive, HostListener, Input, ViewContainerRef} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TooltipContentComponent} from "./tooltip-content.component";
import {TooltipPlacement} from "./types";
import {fromEvent} from "rxjs/observable/fromEvent";
import {first} from "rxjs/operators";


@Directive({
    selector: "[ct-tooltip]"
})
export class TooltipDirective extends DirectiveBase {

    @Input("ct-tooltip")
    content: string | TooltipContentComponent;

    @Input()
    tooltipDisabled = false;

    @Input()
    tooltipAnimation = false;

    @Input()
    tooltipPlacement: TooltipPlacement = "top";

    private tooltip: ComponentRef<TooltipContentComponent>;

    private visible: boolean;

    constructor(private viewContainerRef: ViewContainerRef,
                private resolver: ComponentFactoryResolver) {

        super();

    }

    @HostListener("focusin")
    @HostListener("mouseenter")
    show(): void {
        if (this.tooltipDisabled || this.visible) {
            return;
        }

        this.visible = true;

        let instance = this.content as TooltipContentComponent;

        if (typeof this.content === "string") {

            const factory = this.resolver.resolveComponentFactory(TooltipContentComponent);
            this.tooltip  = this.viewContainerRef.createComponent(factory);

            instance         = this.tooltip.instance;
            instance.content = this.content;
        }

        instance.hostElement = this.viewContainerRef.element.nativeElement;
        instance.placement   = this.tooltipPlacement;
        instance.animation   = this.tooltipAnimation;

        instance.show();

        fromEvent(window, "wheel").pipe(
            first()
        ).subscribeTracked(this, () => this.hide());
    }

    @HostListener("focusout")
    @HostListener("mouseleave")
    hide(): void {
        if (!this.visible) {
            return;
        }

        this.visible = false;

        if (this.tooltip) {
            this.tooltip.destroy();
        }

        if (this.content instanceof TooltipContentComponent) {

            (this.content as TooltipContentComponent).hide();
        }
    }

}
