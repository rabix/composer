import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {ToolSidebarService} from "./tool-sidebar.service";

@Injectable()
export class InputSidebarService {

    public isOpen: Observable<boolean>;

    private updateOpenState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** The current input port */
    public inputPortStream: Observable<InputProperty>;

    /** Update the input port */
    private updateInputPortStream: BehaviorSubject<InputProperty> = new BehaviorSubject<InputProperty>(undefined);

    constructor(private toolSidebarService: ToolSidebarService) {

        this.inputPortStream = this.updateInputPortStream
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();

        this.isOpen = this.updateOpenState
            .publishReplay(1)
            .refCount();
    }

    public openInputInspector(inputProperty: InputProperty) {
        this.updateInputPortStream.next(inputProperty);
        this.updateOpenState.next(true);
        this.toolSidebarService.addSideBarOnTopOfStack("input-inspector");
    }

    public closeInputInspector() {
        this.updateOpenState.next(false);
        this.toolSidebarService.removeSideBarFromStack("input-inspector");
    }
}
