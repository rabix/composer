import {Directive, ViewContainerRef, Input, ComponentFactory} from "@angular/core";

@Directive({
    selector: "[dynamicallyCompiled]",
    inputs:[
        "factory:dynamicallyCompiled",
        "model:model"
    ]

})
export class DynamicallyCompiledComponentDirective {

    private model;
    private factory;
    constructor(private viewContainer: ViewContainerRef) {

    }

    ngOnInit(){

        console.log("Initialized", this.model, this.factory);
    }

    @Input() set dynamicallyCompiled(comp: ComponentFactory) {
        this.viewContainer.clear();

        //noinspection TypeScriptUnresolvedVariable
        this.viewContainer.createComponent(comp).instance.model = this.model;

    }
}
