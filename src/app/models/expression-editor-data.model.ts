import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/lib/models/d2sb";

export class ExpressionEditorData {
    expression: string;
    newExpressionChange: Subject<string | ExpressionModel>;

    constructor(attrs: {
        expression: string;
        newExpressionChange: Subject<string | ExpressionModel>;
    }) {
        this.expression = attrs.expression;
        this.newExpressionChange = attrs.newExpressionChange;
    }
}
