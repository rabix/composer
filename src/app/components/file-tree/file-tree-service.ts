import {Injectable, Injector, ComponentFactory} from "@angular/core";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {Observable, Subject} from "rxjs/Rx";
import {FilePath} from "../../services/api/api-response-types";

@Injectable()
export class FileTreeService {

    private dataProvider;

    public fileOpenStream: Subject<FilePath>;


    constructor(private injector: Injector) {
        this.fileOpenStream = new Subject();

        // Injecting AsyncSocketProviderService into the constructor doesn't work at this moment
        // @TODO(ivanb) find out why this works
        this.dataProvider = injector.get(AsyncSocketProviderService);


    }

    public openFile(fileInfo: FilePath): void {
        this.fileOpenStream.next(fileInfo);
    }

    public getDataProviderForDirectory(directory? = ""): () => Observable<ComponentFactory[]> {

        return () => this.dataProvider.getNodeContent(directory);
    }

    ngOnInit() {
    }
}
