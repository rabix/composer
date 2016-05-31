import {ComponentFactory, Injector, ComponentRef} from "@angular/core";
import {ComponentState} from "./component-state";
export class DynamicComponentContext<C> {

    constructor(private componentFactory: ComponentFactory<C>,
                private componentState: ComponentState = new ComponentState({}),
                private injector: Injector = null) {
    }

    public create(): ComponentRef<C> {

        const component = this.componentFactory.create(this.injector);

        
        
        return component;
    }
}
