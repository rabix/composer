import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {ExpressionEditorData} from "../../models/expression-editor-data.model";
import {ToolSidebarService} from "./tool-sidebar.service";

@Injectable()
export class ExpressionSidebarService {

    /** The current expression */
    public expressionDataStream: Observable<ExpressionEditorData>;

    /** Update the current expression */
    private updateExpressionEditorData = new BehaviorSubject<ExpressionEditorData>(undefined);

    constructor(private toolSidebarService: ToolSidebarService) {

        this.expressionDataStream = this.updateExpressionEditorData
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();
    }

    public openExpressionEditor(expressionEditorData: ExpressionEditorData) {
        this.updateExpressionEditorData.next(expressionEditorData);
        this.toolSidebarService.addSideBarOnTopOfStack("expression-sidebar")
    }

    public closeExpressionEditor() {
        this.toolSidebarService.removeSideBarFromStack("expression-sidebar")
    }
}
