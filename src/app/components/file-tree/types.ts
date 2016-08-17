import {Observable} from "rxjs/Rx";
import {DynamicComponentContext} from "../runtime-compiler/dynamic-component-context";

export type DirectoryDataProviderFactory = () => Observable<Array<DynamicComponentContext<any>>>
