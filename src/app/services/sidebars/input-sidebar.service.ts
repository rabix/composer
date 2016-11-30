import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToolSidebarService} from "./tool-sidebar.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

export interface InputInspectorData {
    inputProperty: InputProperty;
    context: any;
}

@Injectable()
export class InputSidebarService {

    /** The current input port */
    public inputInspectorDataStream: Observable<InputInspectorData>;

    /** Update the input port */
    private updateInputInspectorData: BehaviorSubject<InputInspectorData> = new BehaviorSubject<InputInspectorData>(undefined);

    private updateInputStream: BehaviorSubject<InputProperty>;

    constructor(private toolSidebarService: ToolSidebarService) {
        this.inputInspectorDataStream = this.updateInputInspectorData
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();
    }

    public openInputInspector(inputProperty: InputInspectorData): Observable<InputProperty> {
        this.updateInputStream = new BehaviorSubject<InputProperty>(undefined);
        this.updateInputInspectorData.next(inputProperty);
        this.toolSidebarService.addSideBarOnTopOfStack("input-inspector");

        return this.updateInputStream.filter(update => update !== undefined);
    }

    public updateInputPort(inputProperty: InputProperty): void {
        this.updateInputStream.next(inputProperty);
    }

    public closeInputInspector(): void {
        this.toolSidebarService.removeSideBarFromStack("input-inspector");
    }
}
