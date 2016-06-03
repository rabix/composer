import {File} from "./fs.models";
export type Tree = TreeNode[];

export enum NodeExpansionState {
    Expanded,
    Contracted,
    NonExpandable
}

export class TreeNode<C> {

    protected title;
    protected parent: TreeNode<any>;
    protected children: TreeNode<any>[] = [];
    protected expansionState: NodeExpansionState;
    protected representedObject: C;

    public static represent(obj: C, params?: {
        parent?: TreeNode<any>
        children?: TreeNode<any>[],
        title?: string,
    }): TreeNode<C> {
        let node = new TreeNode<C>();

        node.representedObject = obj;

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

    public getRepresentedObject() {
        return this.representedObject;
    }

}

let file = File.createFromObject({name: "myfile.txt"});
let node = TreeNode.represent(file, {
    title: file.name
});
