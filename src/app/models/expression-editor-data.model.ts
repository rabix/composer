import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";

export class ExpressionEditorData {
    expression: ExpressionModel;
    newExpressionChange: Subject<string | ExpressionModel>;

    constructor(attrs: {
        expression: ExpressionModel;
        newExpressionChange: Subject<string | ExpressionModel>;
    }) {
        this.expression = attrs.expression;
        this.newExpressionChange = attrs.newExpressionChange;
    }
}
