import {Observable, Subscription} from "rxjs/Rx";

export interface TreeNode {
    name: string;
    model?: any,
    icon?: string,
    isExpandable?: boolean;
    openHandler?: (model) => Subscription;
    childrenProvider?: (model)=>Observable<TreeNode[]>;
}

