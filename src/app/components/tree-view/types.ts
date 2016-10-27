import {Observable} from "rxjs/Rx";

export interface TreeNode {
    name: string;
    icon?: Observable<string>,
    isExpandable?: boolean;
}

export interface OpenableTreeNode extends TreeNode {
    openHandler: (...any: any[]) => Observable<any>;
}

export interface ParentTreeNode extends TreeNode {
    childrenProvider: (...any: any[]) => Observable<TreeNode[]>
}

