import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";

export class ExpressionEditorData {
    value: ExpressionModel;
    newExpressionChange: Subject<ExpressionModel>;
    context: any;

    constructor(attrs: {
        value: ExpressionModel;
        newExpressionChange: Subject<ExpressionModel>;
        context?: any
    }) {
        this.value               = attrs.value;
        this.newExpressionChange = attrs.newExpressionChange;
        this.context             = attrs.context;
    }
}
