import {Directive, HostListener, ComponentRef, ViewContainerRef, Input, ComponentFactoryResolver} from "@angular/core";
import {TooltipContentComponent} from "./tooltip-content.component";
import {TooltipPlacement} from "./types";


@Directive({
    selector: "[ct-tooltip]"
})
export class TooltipDirective {

    @Input("ct-tooltip")
    public content: string | TooltipContentComponent;

    @Input()
    public tooltipDisabled = false;

    @Input()
    public tooltipAnimation = false;

    @Input()
    public tooltipPlacement: TooltipPlacement = "top";

    private tooltip: ComponentRef<TooltipContentComponent>;

    private visible: boolean;

    constructor(private viewContainerRef: ViewContainerRef,
                private resolver: ComponentFactoryResolver) {
    }

    @HostListener("focusin")
    @HostListener("mouseenter")
    public show(): void {
        if (this.tooltipDisabled || this.visible) {
            return;
        }

        this.visible = true;

        let instance = this.content as TooltipContentComponent;

        if (typeof this.content === "string") {

            const factory = this.resolver.resolveComponentFactory(TooltipContentComponent);
            this.tooltip  = this.viewContainerRef.createComponent(factory);

            instance = this.tooltip.instance;
        }

        instance.hostElement = this.viewContainerRef.element.nativeElement;
        instance.placement   = this.tooltipPlacement;
        instance.animation   = this.tooltipAnimation;

        instance.show();
        return;
    }

    @HostListener("focusout")
    @HostListener("mouseleave")
    public hide(): void {
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