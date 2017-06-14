import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ExpressionModel} from "cwlts/models";
import {noop} from "../../../lib/utils.lib";
import {ModelExpressionEditorComponent} from "../../expression-editor/model-expression-editor.component";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    encapsulation: ViewEncapsulation.None,

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
        <div class="expression-input-group clickable"
             [ct-validation-class]="model"
             [class.expr]="isExpr || disableLiteralTextInput">

            <ct-validation-preview [entry]="model"></ct-validation-preview>
            <b class="validation-icon result"
               *ngIf="isExpr && !(model?.hasErrors || model?.hasWarnings)"
               [title]="result">E:</b>

            <div class="input-group">

                <input class="form-control"
                       data-test="expression-input"
                       #input
                       [type]="isExpr ? 'text' : type"
                       [value]="model?.toString() || ''"
                       [readonly]="isExpr || disableLiteralTextInput || readonly"
                       (blur)="onTouch()"
                       (click)="editExpr(isExpr || disableLiteralTextInput && !readonly ? 'edit' : null, $event)"
                       (change)="editString(input.value)"/>

                <span class="input-group-btn" *ngIf="!readonly">
                        <button type="button"
                                class="btn btn-secondary btn-icon"
                                (click)="editExpr(isExpr ? 'clear' : 'edit', $event)">
                            <i class="fa"
                               [ngClass]="{'fa-times': isExpr,
                                            'fa-code': !isExpr}"></i>
                        </button>
                    </span>
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

    /** When set to true, only expressions are allowed */
    @Input()
    disableLiteralTextInput = false;

    @Input()
    readonly = false;

    /** Flag if model is expression or primitive */
    isExpr = false;

    /**
     * Internal ExpressionModel on which changes are made
     */
    model: ExpressionModel;

    /**
     * Result gotten from expression evaluation
     */
    result: any;

    /**
     * Declaration of change function
     */
    private onChange = noop;

    /**
     * Declaration of touch function
     */
    onTouch = noop;


    /**
     * From ControlValueAccessor
     * Write a new value to the element when initially loading formControl
     * @param obj
     */
    writeValue(obj: ExpressionModel): void {
        if (!(obj instanceof ExpressionModel)) {
            console.warn(`ct-expression-input expected ExpressionModel, instead got ${obj}`);
        }

        if (obj) {
            this.model  = obj;
            this.isExpr = obj.isExpression;
            this.model.validate(this.context).then(noop, noop);
        }
    }

    /**
     * From ControlValueAccessor
     * @param fn
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * From ControlValueAccessor
     * @param fn
     */
    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    constructor(private modal: ModalService) {
        super();
    }

    /**
     * Callback for setting string value to model
     * @param str
     */
    editString(str: number | string) {
        if (this.type === "number") {
            str = Number(str);
        }

        this.model.cleanValidity();
        this.model.setValue(str, this.type);
        this.onChange(this.model);
    }

    /**
     * Callback for setting or clearing expression value
     * @param action
     * @param event
     */
    editExpr(action: "clear" | "edit", event: Event): void {

        if (!action) {
            return;
        }

        if (action === "edit") {
            const editor = this.modal.fromComponent(ModelExpressionEditorComponent, {
                backdrop: true,
                closeOnOutsideClick: false,
                closeOnEscape: false,
                title: "Edit Expression"
            });

            editor.readonly = this.readonly;

            editor.model   = this.model.clone();
            editor.context = this.context;
            editor.action.first().subscribe(editorAction => {

                if (editorAction === "save") {
                    const val = editor.model.serialize();

                    if (!val) {
                        editor.model.setValue("", this.type);
                    }

                    this.model.cloneStatus(editor.model);

                    this.isExpr = this.model.isExpression;
                    this.model.validate(this.context).then(() => {
                        this.onChange(this.model);
                    }, err => console.warn);
                }

                this.modal.close();
            });
        }

        if (action === "clear") {
            this.modal.delete("expression").then(() => {
                this.model.cleanValidity();
                this.model.setValue("", this.type);
                this.model.result = null;
                this.isExpr       = false;
                event.stopPropagation();
                this.model.validate(this.context).then(() => {
                    this.onChange(this.model);
                }, err => console.warn);
            }, err => console.warn);
        }
    }
}
