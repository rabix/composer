import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";

export class ExpressionEditorData {
    expression: ExpressionModel;
    newExpressionChange: Subject<string | ExpressionModel>;
    context: any;

    constructor(attrs: {
        expression: ExpressionModel;
        newExpressionChange: Subject<string | ExpressionModel>;
        context?: any
    }) {
        this.expression = attrs.expression;
        this.newExpressionChange = attrs.newExpressionChange;
        this.context = attrs.context;
    }
}
