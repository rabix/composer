import {FileModel, FSItemModel} from "../store/models/fs.models";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Rx";

interface ModifierFn extends Function {
    (content: FSItemModel[]): FSItemModel[]
}

@Injectable()
export class FileStateService {

    public create  = new Subject<FSItemModel>();
    public registry = new Subject<FSItemModel[]>();

    private updates = new Subject<any>();

    constructor() {

        this.registry = this.updates
            .scan((content: FSItemModel[], update: ModifierFn) => update(content), [])
            .publishReplay(1)
            .refCount();

        this.create.map((model: FSItemModel) => (content) => content.concat(model))
            .subscribe(this.updates);

    }

    public createItem(model: FSItemModel): void {
        this.create.next(model);
    }
}
