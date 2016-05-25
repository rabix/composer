import {Directive, ViewContainerRef, Input, ComponentFactory, Injector} from "@angular/core";

@Directive({
    selector: "[dynamicallyCompiled]",
    inputs: [
        "factory:dynamicallyCompiled",
        "model:model",
        "injector:injector"
    ]

})
export class DynamicallyCompiledComponentDirective {

    private model;
    private factory: ComponentFactory;
    private injector: Injector = null;

    constructor(private viewContainer: ViewContainerRef) {

    }

    @Input() set dynamicallyCompiled(comp: ComponentFactory) {
        this.viewContainer.clear();

        //noinspection TypeScriptUnresolvedVariable
        this.viewContainer.createComponent(comp, null, this.injector).instance.model = this.model;

    }
}
