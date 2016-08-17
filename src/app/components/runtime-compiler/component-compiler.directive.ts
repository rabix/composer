import {Directive, ViewContainerRef, Input, Injector} from "@angular/core";
import {DynamicComponentContext} from "./dynamic-component-context";
import {hasDynamicState} from "./dynamic-state.interface";

@Directive({
    selector: "[component-compiler]",

})
export class ComponentCompilerDirective {

    @Input("component-compiler") context: DynamicComponentContext<any>;

    constructor(private view: ViewContainerRef,
                private injector: Injector) {
    }

    ngOnInit() {
        this.view.clear();

        let component = this.view.createComponent(this.context.getFactory(), null, this.injector);
        let instance  = component.instance;

        if (hasDynamicState(instance)) {
            instance.setState(this.context.getState());
        } else {
            Object.assign(instance, this.context.getState());
        }
    }
}
