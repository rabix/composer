import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {ExpressionEditorData} from "../../models/expression-editor-data.model";

@Injectable()
export class ExpressionSidebarService {

    public isOpen: Observable<boolean>;

    private updateOpenState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** The current expression */
    public expressionDataStream: Observable<ExpressionEditorData>;

    /** Update the current expression */
    private updateExpressionEditorData: BehaviorSubject<ExpressionEditorData> = new BehaviorSubject<ExpressionEditorData>(undefined);

    constructor() {
        this.expressionDataStream = this.updateExpressionEditorData
            .filter(update => update !== undefined)
            .publishReplay(1)
            .refCount();

        this.isOpen = this.updateOpenState
            .publishReplay(1)
            .refCount();
    }

    public openExpressionEditor(expressionEditorData: ExpressionEditorData) {
        this.updateExpressionEditorData.next(expressionEditorData);
        this.updateOpenState.next(true);
    }

    public closeExpressionEditor() {
        this.updateOpenState.next(false);
    }
}
