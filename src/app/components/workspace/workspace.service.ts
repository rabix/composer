import {Injectable} from "@angular/core";
import {FileModel} from "../../store/models/fs.models";
import {Observable, BehaviorSubject, Subject, Subscription} from "rxjs/Rx";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenFileRequestAction, CloseFileAction, FileCreatedAction} from "../../action-events/index";
import {FileRegistry} from "../../services/file-registry.service";

interface FileUpdateFn extends Function {
    (content: FileModel[]): FileModel[]
}

@Injectable()
export class WorkspaceService {
    /**
     * Observable that holds the list of all open files
     */
    public openFiles: Observable<FileModel[]>;

    /**
     * Stream of items that should be selected and shown
     */
    public selectedFile: Observable<FileModel>;

    /**
     * Stream of FileModels that should be opened, selected and shown
     */
    public onLoadFile: Observable<FileModel>;

    /**
     * Stream of intentions to close a particular file
     */
    public onCloseFile: Observable<FileModel>;

    /**
     * Holds a list of subscriptions that should be disposed when the service is no longer needed
     */
    private _subs: Subscription[];

    private selectFile: Subject<FileModel>;

    /**
     * Updates to the open files list
     */
    private fileUpdates: Subject<FileUpdateFn>;

    constructor(private eventHub: EventHubService, private files: FileRegistry) {

        this.fileUpdates = new Subject<FileUpdateFn>();
        this.onLoadFile  = new Subject<FileModel>();
        this.openFiles   = new BehaviorSubject<FileModel[]>([]);

        this.selectFile   = new BehaviorSubject<FileModel>(undefined);
        this.selectedFile = this.selectFile.switchMap(f => {
            if (f) {
                return this.files.watchFile(f);
            }
            return Observable.of(null);
        });

        this._subs = [];

        this.onCloseFile = this.eventHub.onValueFrom(CloseFileAction);
        /**
         * Distribute the open file requests between the "selectedFile" and "loadFile" updates
         */
        this.eventHub.onValueFrom(OpenFileRequestAction)
            .withLatestFrom(this.openFiles, (load, all) => ({load, all}))
            .groupBy(set => set.all.find(i => i.id === set.load.id) ? "open" : "")
            .subscribe(selector => {
                if (selector.key !== "open") {
                    selector.map(set => set.load).subscribe(this.onLoadFile as Subject<FileModel>);
                }
                selector.map(set => set.load).subscribe(this.selectFile as Subject<FileModel>);
            });

        this.eventHub.onValueFrom(CloseFileAction)
            .map(file => content => content.filter(item => item.id !== file.id))
            .subscribe(this.fileUpdates);


        this.eventHub.onValueFrom(OpenFileRequestAction)
            .map(f => all => all.concat(f))
            .subscribe(this.fileUpdates);

        this.eventHub.onValueFrom(CloseFileAction)
            .withLatestFrom(this.openFiles, this.selectFile, (closing, open, selected) => {
                if (closing !== selected) {
                    return selected;
                }
                return open[open.length - 1];
            })
            // When 3 files are open, 1st one selected, and you close the 3rd one, GoldenLayout switches to the 2nd one
            .flatMap(selected => Observable.of(selected).delay(1))
            .subscribe(this.selectFile as Subject<FileModel>);

        this.eventHub.onValueFrom(FileCreatedAction)
            .subscribe(file => this.eventHub.publish(new OpenFileRequestAction(file)));

        this.fileUpdates
            .scan((content: FileModel[], update: FileUpdateFn) => update(content), [])
            .subscribe(this.openFiles as Subject<FileModel[]>);


    }


    public watchFile(file: FileModel) {
        return this.files.watchFile(file);
    }

    public openFile(file: FileModel): void {
        this.eventHub.publish(new OpenFileRequestAction(file));
    }

    public closeFile(file: FileModel): void {
        this.eventHub.publish(new CloseFileAction(file));
    }

    public pleaseDontLeaveMemoryLeaks() {
        this._subs.forEach(sub => sub.unsubscribe());
    }

}
