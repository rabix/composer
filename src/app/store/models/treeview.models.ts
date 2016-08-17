export type Tree = TreeNode<any>[];

export enum NodeExpansionState {
    Expanded,
    Contracted,
    NonExpandable
}

export class TreeNode<C> {

    protected title;
    protected parent: TreeNode<any>;
    protected children: TreeNode<any>[] = [];
    protected expansionState: NodeExpansionState = NodeExpansionState.Contracted;
    protected embedded: C;

    public static represent<T>(obj: T, params?: {
        parent?: TreeNode<any>
        children?: TreeNode<any>[],
        title?: string,
    }): TreeNode<T> {
        let node = new TreeNode<T>();

        node.embedded = obj;

        return node;
    }

    public setExpansionState(state: NodeExpansionState) {
        this.expansionState = state;
    }

    public getChildren(): TreeNode<any>[] {
        return this.children;
    }

    public getParent(): TreeNode<any> {
        return this.parent;
    }

    public getEmbedded() {
        return this.embedded;
    }

}
