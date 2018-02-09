export const TAB_CLOSE = "[Core] tab close";

export class TabCloseAction {

    type = TAB_CLOSE;

    constructor(public tabID: string) {

    }

}
