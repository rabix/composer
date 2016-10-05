import {Subject} from "rxjs/Subject";

export class ExpressionEditorData {
    expression: string;
    newExpressionChange: Subject<any>;

    constructor(attrs: {
        expression: string;
        newExpressionChange: Subject<any>;
    }) {
        this.expression = attrs.expression;
        this.newExpressionChange = attrs.newExpressionChange;
    }
}
