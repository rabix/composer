import {Injectable, Injector} from "@angular/core";
import {AsyncSocketProviderService} from "./async-socket-provider.service";

@Injectable()
export class FileTreeService {

    private dataProvider;

    constructor(private injector: Injector) {
        // Injecting AsyncSocketProviderService into the constructor doesn't work at this moment
        // @TODO(ivanb) find out why this works
        this.dataProvider = injector.get(AsyncSocketProviderService);
    }

    public getDataProviderForDirectory(directory? = "") {

        return () => this.dataProvider.getNodeContent(directory);
    }

    ngOnInit() {
    }
}
