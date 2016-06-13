import {FSItemModel} from "../store/models/fs.models";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Rx";

interface ModifierFn extends Function {
    (content: FSItemMap): FSItemMap
}

export type FSItemMap = {[relativePath: string]: FSItemModel};

@Injectable()
export class FileStateService {

    public create   = new Subject<FSItemModel|FSItemModel[]>();
    public registry = new Subject<FSItemMap>();

    private updates = new Subject<any>();

    constructor() {

        this.registry = this.updates
            .scan((content: FSItemMap, update: ModifierFn) => update(content), {})
            .publishReplay(1)
            .refCount();

        this.create
            .do(_ => console.log("Pushing to updates", _))
            .map((model: FSItemModel) => (content) => {
                [].concat(model).forEach((m: FSItemModel) => content[m.relativePath] = m);
                return content;
            })
            .subscribe(this.updates);

    }

    public createItem(model: FSItemModel | FSItemModel[]): void {
        if (!model) {
            throw new Error("Trying to insert an empty model into the repository");
        }
        this.create.next(model);

    }
}
