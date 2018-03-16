import {ChangeDetectorRef, Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ExpressionModel} from "cwlts/models";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ModelExpressionEditorComponent} from "../../expression-editor/model-expression-editor.component";
import {take} from "rxjs/operators";

@Component({
    selector: "ct-expression-input",
    styleUrls: ["./expression-input.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ExpressionInputComponent),
            multi: true
        }
    ],
    template: `
        <div *ngIf="control.value" class="expression-input-group clickable"
             [ct-validation-class]="control.value"
             [class.direct-editing-disabled]="control.value.isExpression || disableLiteralTextInput || readonly || control.disabled">

            <ct-validation-preview [entry]="control.value"></ct-validation-preview>

            <b *ngIf="control.value.isExpression && !control.value.warnings.length && !control.value.errors.length"
               [title]="result"
               class="validation-icon result">E:</b>

            <div class="input-group">

                <input #input class="form-control" data-test="expression-input"
                       [type]="control.value.isExpression ? 'text' : type"
                       [ngModel]="textFieldValue"
                       (ngModelChange)="applyStringUpdate(input.value)"
                       [readonly]="readonly || disableLiteralTextInput || control.value.isExpression || control.disabled"
                       (click)="control.value.isExpression && editExpression()"/>

                <button type="button"
                        *ngIf="!readonly"
                        class="btn btn-secondary btn-icon"
                        data-test="edit-expr-button"
                        (click)="control.value.isExpression ? clearExpression() : editExpression()">

                    <i class="fa" [class.fa-times]="control.value.isExpression" [class.fa-code]="!control.value.isExpression"></i>
                </button>
            </div>

        </div>
    `
})
export class ExpressionInputComponent extends DirectiveBase implements ControlValueAccessor {
    /**
     * Context in which expression should be executed
     */
    @Input()
    context: any = {};

    @Input()
    type: "string" | "number" = "string";

    /**
     * When set to true, only expressions are allowed
     * This is needed for conformance with sbg:draft-2 cases where CWL specs allow expressions, but not string literals.
     * V1.0 has no places where an expression is accepted, but not a string.
     *
     * @see http://www.commonwl.org/draft-2/#commandoutputbinding outputEval, this is what we should handle
     * @see http://www.commonwl.org/draft-2/#expressiontool expression, but ExpressionTool is not supported in Composer
     */
    @Input()
    disableLiteralTextInput = false;

    @Input()
    readonly = false;

    /** Result gotten from expression evaluation */
    result: any;

    /**
     * @type {FormControl} contains {@see ExpressionModel} on which changes are made
     */
    control: FormControl;

    /**
     * This reflects the string value of {@link control.value}
     * but we do not want to bind the template to that value directly because editing would end up in a writing loop.
     * This is updated only on external write, and after an expression is edited.
     * Otherwise, user typing into the field would trigger a control value change that would then end up rewriting the field,
     * stripping whitespaces in the process and doing other weird stuff.
     */
    textFieldValue = "";


    private propagateChange = (value?) => void 0;
    private propagateTouch  = () => void 0;

    constructor(private modal: ModalService,
                private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.control = new FormControl();

        this.control.valueChanges.subscribeTracked(this, () => {
            this.propagateChange(this.control.value);
        });
    }

    writeValue(expressionModel: ExpressionModel): void {
        if (!(expressionModel instanceof ExpressionModel)) {
            console.warn(`ct-expression-input expected ExpressionModel, instead got ${expressionModel}`);
            return;
        }

        this.control.setValue(expressionModel, {emitEvent: false});
        this.textFieldValue = this.control.value.toString();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }

    /**
     * Callback for setting string value to model
     * @param str
     */
    applyStringUpdate(str: string) {
        let val          = this.type === "number" ? Number(str) : str;
        const expression = this.control.value as ExpressionModel;
        expression.setValue(val, this.type);
        this.propagateChange(expression);
    }


    setDisabledState(isDisabled: boolean): void {

    }

    editExpression() {

        const expression = this.control.value as ExpressionModel;

        const expressionEditor = this.modal.fromComponent(ModelExpressionEditorComponent, "Expression Editor", {
            readonly: this.readonly || this.control.value.disabled,
            model: expression.clone(),// @TODO check why we need to clone the model
            context: this.context,
        });

        expressionEditor.submit.pipe(
            take(1)
        ).subscribeTracked(this, () => {
            const val = expressionEditor.model.serialize();

            if (!val) {
                expressionEditor.model.setValue("", this.type);
            }

            // @TODO check what status cloning does
            expression.cloneStatus(expressionEditor.model);
            this.control.setValue(expression);
            this.textFieldValue = this.control.value.toString();
            this.cdr.markForCheck();

            this.modal.close();
        });
    }

    clearExpression() {
        const expression = this.control.value as ExpressionModel;

        this.modal.delete("expression").then(() => {

            expression.setValue("", "string");
            this.textFieldValue = expression.toString();

            this.propagateChange(expression);
            event.stopPropagation();
            this.cdr.markForCheck();
        }, err => console.warn);
    }
}
