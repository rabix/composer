import {Observable} from "rxjs/Observable";

export interface TreeNode<T> {
    id?: string;
    type?: string;
    icon?: string;
    label?: string;
    iconExpanded?: string;
    isExpandable?: boolean;
    isExpanded?: Observable<boolean>;
    children?: Observable<TreeNode<any>[]>;
    data?: T;

    dragEnabled?: boolean;
    dragTransferData?: any;
    dragLabel?: string;
    dragImageClass?: string;
    dragDropZones?: string[];
}
