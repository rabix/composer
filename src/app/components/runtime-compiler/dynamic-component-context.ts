import {ComponentFactory} from "@angular/core";

export class DynamicComponentContext<C> {

    constructor(private componentFactory: ComponentFactory<C>,
                private componentState: Object = {}) {
    }

    getFactory(): ComponentFactory<C> {
        return this.componentFactory;
    }

    getState(): Object {
        return this.componentState;
    }
}
