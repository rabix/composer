import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {TreeNodeComponent} from "./tree-node/tree-node.component";
import {TreeViewComponent} from "./tree-view.component";

@Injectable()
export class TreeViewService {

    treeView: TreeViewComponent;

    readonly open             = new Subject<TreeNodeComponent<any>>();
    readonly expansionChanges = new Subject<TreeNodeComponent<any>>();
    readonly selected         = new BehaviorSubject<TreeNodeComponent<any>>(undefined);
    readonly nodeInit         = new Subject<TreeNodeComponent<any>>();
    readonly contextMenu      = new Subject<{node: TreeNodeComponent<any>, coordinates: { x: number, y: number }}>();



    constructor() {
    }

    getChildren() {
        return this.treeView.getChildren();
    }

    getAllChildren(): TreeNodeComponent<any>[] {
        const reducer = (acc: TreeNodeComponent<any>[],
                         item: TreeNodeComponent<any>) => acc.concat(item, item.getChildren().reduce(reducer, []));

        return this.getChildren().reduce(reducer, []);
    }


}
