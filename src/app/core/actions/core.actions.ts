export class TabCloseAction {

    static readonly type = "[Core] tab close";
    readonly type = TabCloseAction.type;

    constructor(public tabID: string) {
    }

}
