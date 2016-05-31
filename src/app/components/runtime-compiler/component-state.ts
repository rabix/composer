import {ComponentRef} from "@angular/core";
export class ComponentState<C> {

    constructor(private componentData: Object = {}) {

    }

    public mapToInstance(component: ComponentRef<C>): void {
        Object.keys(this.componentData).forEach((key) => {

        });
    }

}
