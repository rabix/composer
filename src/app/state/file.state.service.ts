import {FSItemModel, FileModel, DirectoryModel} from "../store/models/fs.models";
import {Injectable} from "@angular/core";
import {Subject, Observable} from "rxjs/Rx";
import {EventHubService} from "../services/event-hub/event-hub.service";
import {FileCreatedAction, FileDeletedAction, FolderDeletedAction} from "../action-events/index";

interface ModifierFn extends Function {
    (content: FSItemMap): FSItemMap
}

export type FSItemMap = {[relativePath: string]: FSItemModel};

/**
 * @deprecated
 * @TODO(ivanb) Move this logic out of the old "state" thing into the file tree service
 */
@Injectable()
export class FileStateService {

    public create   = new Subject<FSItemModel|FSItemModel[]>();
    public delete   = new Subject<FSItemModel|FSItemModel[]>();
    public registry = new Observable<FSItemMap>();

    private updates = new Subject<any>();

    constructor(private eventHub: EventHubService) {

        this.registry = this.updates
            .scan((content: FSItemMap, update: ModifierFn) => update(content), {})
            .publishReplay(1)
            .refCount();

        this.create.map((model: FSItemModel) => (content) => {
            [].concat(model).forEach((m: FSItemModel) => content[m.relativePath] = m);
            return content;
        }).subscribe(this.updates);

        this.delete.map((model: FileModel) => content => {
            delete content[model.relativePath];
            return content;
        }).subscribe(this.updates);

        this.eventHub.onValueFrom(FileCreatedAction).subscribe(this.create);

        this.eventHub.onValueFrom(FileDeletedAction).subscribe(this.delete);

        this.eventHub.onValueFrom(FolderDeletedAction).subscribe(path => {
            this.updates.next((content) => {
                const newRegistry = {};
                Object.keys(content)
                    .filter(key => !(content[key] instanceof DirectoryModel && content[key].absolutePath === path))
                    .forEach(key => newRegistry[key] = content[key]);

                return newRegistry;
            });
        })

    }

    public createItem(model: FSItemModel | FSItemModel[]): void {
        if (!model) {
            throw new Error("Trying to insert an empty model into the repository");
        }
        this.create.next(model);

    }
}
