import {Observable} from "rxjs/Rx";
import {DynamicComponentContext} from "../../runtime-compiler";

export interface TreeDataProvider {
    getNodeContent();
}

export type ComponentFactoryProviderFn = () => Observable<DynamicComponentContext[]>;
