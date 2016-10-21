import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToolSidebarService} from "./tool-sidebar.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

@Injectable()
export class InputSidebarService {

    /** The current input port */
    public inputPortDataStream: Observable<InputProperty>;

    /** Update the input port */
    private updateInputPortData: BehaviorSubject<InputProperty> = new BehaviorSubject<InputProperty>(undefined);

    constructor(private toolSidebarService: ToolSidebarService) {
        this.inputPortDataStream = this.updateInputPortData
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();
    }

    public openInputInspector(inputProperty: InputProperty) {
        this.updateInputPortData.next(inputProperty);
        this.toolSidebarService.addSideBarOnTopOfStack("input-inspector");
    }

    public closeInputInspector() {
        this.toolSidebarService.removeSideBarFromStack("input-inspector");
    }
}
