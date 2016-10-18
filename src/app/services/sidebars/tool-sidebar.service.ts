import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs/Rx";

declare type SidebarType = "input-inspector" | "expression-sidebar";

@Injectable()
export class ToolSidebarService {

    private sidebarStack: SidebarType[] = [];

    public sidebarStackStream: Observable<SidebarType[]>;

    private updateSidebarStack: BehaviorSubject<SidebarType[]> = new BehaviorSubject<SidebarType[]>(undefined);

    constructor() {
        this.sidebarStackStream = this.updateSidebarStack
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();
    }


    public addSideBarOnTopOfStack(sidebarName: SidebarType) {
        if (this.sidebarStack.indexOf(sidebarName) !== -1) {
            this.removeSideBarFromStack(sidebarName);
        }

        this.sidebarStack.unshift(sidebarName);
        this.updateSidebarStack.next(this.sidebarStack);
    }

    public removeSideBarFromStack(sidebarName: string) {
        this.sidebarStack = this.sidebarStack.filter(sidebar => {
            return sidebar !== sidebarName;
        });
        this.updateSidebarStack.next(this.sidebarStack);
    }
}
