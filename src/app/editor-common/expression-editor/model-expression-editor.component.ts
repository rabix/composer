import {Component, Input, Output} from "@angular/core";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ReplaySubject, Subject} from "rxjs";

@Component({
    selector: "ct-model-expression-editor",
    template: `
        <ct-expression-editor [evaluator]="evaluator" 
                              [context]="context"
                              (action)="action.next($event)"
                              [editorContent]="rawCode"></ct-expression-editor>
    `
})
export class ModelExpressionEditorComponent {

    @Input()
    public model: ExpressionModel;

    @Input()
    public context: {$job?: any, $self?: any};

    @Output()
    public action = new Subject<"close" | "save">();

    private rawCode = new ReplaySubject<string>();

    private evaluator: (code: string) => string;

    ngOnInit() {

        this.rawCode.next(this.model.toString());

        this.evaluator = (content: string) => {

            this.model = new ExpressionModel(this.model.loc, this.model.serialize());
            this.model.setValue(content, "expression");

            const result             = this.model.evaluate(this.context);
            const {errors, warnings} = this.model.validation;
            const [err]              = [...errors, ...warnings];

            if (err) {
                return err.message + " on " + err.loc;
            }

            return String(result);

        }
    }
}
