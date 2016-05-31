import {Injectable, Injector} from "@angular/core";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {Subject} from "rxjs/Rx";
import {FilePath} from "../../services/api/api-response-types";
import {DirectoryDataProviderFactory} from "./types";
import {HmrState} from "angular2-hmr";

@Injectable()
export class FileTreeService {

    private dataProvider;

    /**
     * An Observable that emits new data whenever user double-clicks on a file in the tree.
     *
     * Example:
     * ```
     *  fileTreeService.fileOpenStream.subscribe(fileInfo => fetch(fileInfo.absolutePath));
     * ```
     */
    public fileOpenStream: Subject<FilePath>;


    constructor(private injector: Injector) {
        this.fileOpenStream = new Subject<FilePath>();

        // Injecting AsyncSocketProviderService into the constructor doesn't work at this moment
        // @TODO(ivanb) find out why this works
        this.dataProvider = injector.get(AsyncSocketProviderService);


    }

    /**
     * Pushes the information about a file to open onto the `fileOpenStream`
     * @param fileInfo
     */
    public openFile(fileInfo: FilePath): void {
        this.fileOpenStream.next(fileInfo);
    }

    public createDataProviderForDirectory(directory = ""): DirectoryDataProviderFactory {

        return () => this.dataProvider.getNodeContent(directory);
    }

    @HmrState() _state = { };
}
