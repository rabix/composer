import {Observable} from "rxjs/Rx";
import {ComponentFactory} from "@angular/core";

export type DirectoryDataProviderFactory = () => Observable<ComponentFactory<any>[]>
