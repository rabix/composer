import {Observable} from "rxjs/Rx";

export interface TreeNode {
    id?: string;
    name: string;
    icon?: Observable<string> | string,
    isExpandable?: boolean;
    openHandler?: (...any: any[]) => Observable<any>;
    childrenProvider?: (...any: any[]) => Observable<TreeNode[]>
}

export interface OpenableTreeNode extends TreeNode {
    openHandler: (...any: any[]) => Observable<any>;
}

export interface ParentTreeNode extends TreeNode {
    childrenProvider: (...any: any[]) => Observable<TreeNode[]>
}

