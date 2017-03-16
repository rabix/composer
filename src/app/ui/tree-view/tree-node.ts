export interface TreeNode<T> {
    id?: string;
    type?: string;
    icon?: string;
    label?: string;
    isExpanded?: boolean;
    iconExpanded?: string;
    isExpandable?: boolean;
    children?: TreeNode<any>[];
    data?: T;
}
