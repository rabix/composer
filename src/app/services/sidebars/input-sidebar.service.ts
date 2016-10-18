import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToolSidebarService} from "./tool-sidebar.service";
import {InputPropertyViewModel} from "../input-port/input-port.service";

@Injectable()
export class InputSidebarService {

    /** The current input port */
    public inputPortDataStream: Observable<InputPropertyViewModel>;

    /** Update the input port */
    private updateInputPortData: BehaviorSubject<InputPropertyViewModel> = new BehaviorSubject<InputPropertyViewModel>(undefined);

    constructor(private toolSidebarService: ToolSidebarService) {
        this.inputPortDataStream = this.updateInputPortData
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();
    }

    public openInputInspector(inputProperty: InputPropertyViewModel) {
        this.updateInputPortData.next(inputProperty);
        this.toolSidebarService.addSideBarOnTopOfStack("input-inspector");
    }

    public closeInputInspector() {
        this.toolSidebarService.removeSideBarFromStack("input-inspector");
    }
}
