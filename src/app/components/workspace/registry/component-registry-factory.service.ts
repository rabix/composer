import {ComponentResolver, Injectable, Injector, ApplicationRef} from "@angular/core";
import {ComponentRegistry} from "./component-registry";

@Injectable()
export class ComponentRegistryFactoryService {


    constructor(private resolver: ComponentResolver,
                private injector: Injector,
                private appRef: ApplicationRef) {

    }

    public forLayout(layout: any) {
        return new ComponentRegistry(layout, this.resolver, this.injector, this.appRef);
    }

}
