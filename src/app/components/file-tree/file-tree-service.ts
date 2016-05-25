import {Injectable, Injector, ComponentFactory} from "@angular/core";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {Observable} from "rxjs/Rx";

@Injectable()
export class FileTreeService {

    private dataProvider;

    constructor(private injector: Injector) {
        // Injecting AsyncSocketProviderService into the constructor doesn't work at this moment
        // @TODO(ivanb) find out why this works
        this.dataProvider = injector.get(AsyncSocketProviderService);
    }

    public getDataProviderForDirectory(directory? = ""): () => Observable<ComponentFactory[]> {

        return () => this.dataProvider.getNodeContent(directory);
    }

    ngOnInit() {
    }
}
