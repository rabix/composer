import {Observable} from "rxjs/Observable";

export class ExpressionEditorData {
    expression: Observable<string>;
    updateAction: any;

    constructor(attrs: {
        expression: Observable<string>;
        updateAction: any;
    }) {
        this.expression = attrs.expression;
        this.updateAction = attrs.updateAction;
    }
}
