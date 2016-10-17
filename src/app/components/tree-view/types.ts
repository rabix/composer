import {Observable, Subscription} from "rxjs/Rx";

export interface TreeNode {
    name: string;
    icon?: string,
    isExpandable?: boolean;
    openHandler?: (node) => Subscription;
    childrenProvider?: (node)=>Observable<TreeNode[]>;
}

