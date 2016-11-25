import {Component, ViewContainerRef, HostBinding} from "@angular/core";
import {ComponentBase} from "../../components/common/component-base";
import {Observable} from "rxjs";

@Component({
    selector: "ct-editor-inspector",
    template: "<ng-content></ng-content>"
})
export class EditorInspectorComponent extends ComponentBase {

    @HostBinding("style.top.px")
    private offsetTop;

    @HostBinding("style.height.px")
    private maxHeight;

    private scrollContainer: Element;

    constructor(private vcRef: ViewContainerRef) {
        super();
    }

    ngAfterViewInit() {

        const element        = this.vcRef.element.nativeElement;
        this.scrollContainer = this.findScrollableParent(element);


        this.tracked = Observable.fromEvent(this.scrollContainer, "scroll").subscribe((ev) => {
            this.offsetTop = this.scrollContainer.scrollTop;
        });

        setTimeout(() => {

            const style       = window.getComputedStyle(this.scrollContainer, null);
            const innerHeight = parseFloat(style.height) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
            this.maxHeight    = innerHeight;
        });
    }

    private findScrollableParent(node) {
        if (node === null) {
            return null;
        }

        if (node.scrollHeight > node.clientHeight) {
            return node;
        }
        return this.findScrollableParent(node.parentNode);
    }

}