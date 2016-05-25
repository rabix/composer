import {ComponentFactory} from "@angular/core";
import {Observable} from "rxjs/Rx";

export interface TreeDataProvider {
    getNodeContent();
}

export type ComponentFactoryProviderFn = () => Observable<ComponentFactory[]>;
