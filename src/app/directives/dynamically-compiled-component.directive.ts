import {Directive, ViewContainerRef, Input, ComponentFactory, Injector, OnInit, ComponentRef} from "@angular/core";

@Directive({
    selector: "[dynamicallyCompiled]",
})
export class DynamicallyCompiledComponentDirective implements OnInit {
    private cancel() {};
    private confirm() {};
    private cref:ComponentRef;
    private result:any;

    @Input() model: any;
    @Input() dynamicallyCompiled: ComponentFactory<any>;
    
    @Input() injector: Injector;
    @Input() functions: any;

    constructor(private viewContainer: ViewContainerRef) { }

    ngOnInit() {
        console.log('dynamicallyCompiled ' + this.dynamicallyCompiled);

        this.viewContainer.clear();

        let component = this.viewContainer.createComponent(this.dynamicallyCompiled, null, this.injector).instance;
        component.model = this.model;

        this.cref = this.model.cref;
        this.result = this.model.result;

        if (this.functions) {
            component.confirm = this.functions.confirm.bind(this);
            component.cancel = this.functions.cancel.bind(this);
        }
    }
}
