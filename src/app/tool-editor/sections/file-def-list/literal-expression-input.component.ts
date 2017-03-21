import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {noop} from "../../../lib/utils.lib";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";
import {ModelExpressionEditorComponent} from "../../../editor-common/expression-editor/model-expression-editor.component";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ACE_MODE_MAP} from "../../../ui/code-editor-new/ace-mode-map";
import {MultilangCodeEditorComponent} from "../../../ui/code-editor/multilang-code-editor.component";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-literal-expression-input",
    styleUrls: ["./literal-expression-input.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LiteralExpressionInputComponent),
            multi: true
        }
    ],
    template: `
        <div class="expression-input-group clickable"
             [class.expr]="isExpr"
             [ct-validation-class]="model.validation">

            <ct-validation-preview [entry]="model.validation"></ct-validation-preview>
            <b class="validation-icon result"
               *ngIf="model.result && isExpr"
               [title]="model.result">E:</b>

            <div class="textarea-btn-group">
                
                    <textarea class="form-control"
                              #input
                              [readonly]="isExpr"
                              (blur)="onTouch()"
                              (click)="editExpr(isExpr ? 'edit' : null, $event)"
                              (change)="editLiteral(input.value)">{{ value?.toString() }}</textarea>

                <span class="btn-group">
                        <button type="button"
                                (click)="openLiteralEditor()"
                                [disabled]="value.isExpression"
                                class="btn btn-secondary">
                            <i class="fa fa-expand"></i>
                        </button>
                        <button type="button"
                                class="btn btn-secondary"
                                [disabled]="readonly"
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
export class LiteralExpressionInputComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    context: { $job?: {} } = {};

    @Input()
    fileName: string;

    @Input()
    public readonly = false;

    /**
     * Declaration of change function
     */
    private onChange = noop;

    /**
     * Declaration of touch function
     */
    private onTouch = noop;

    /** Flag if model is expression or primitive */
    public isExpr: boolean = false;

    /**
     * Internal ExpressionModel on which changes are made
     */
    public model: SBDraft2ExpressionModel;


    /** getter for formControl value */
    public get value() {
        return this.model;
    }

    /** setter for formControl value */
    public set value(val: SBDraft2ExpressionModel) {
        if (val !== this.model) {
            this.model = val;
            this.onChange(val);
        }
    }

    constructor(private modal: ModalService) {
        super();
    }

    writeValue(obj: any): void {
        if (!(obj instanceof SBDraft2ExpressionModel)) {
            console.warn(`ct-literal-expression-input expected ExpressionModel, instead got ${obj}`)
        }

        if (obj) {
            this.model = obj;
            this.isExpr = obj.isExpression;
        } else {
            this.model = new SBDraft2ExpressionModel("", "");
            this.isExpr = this.model.isExpression;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    private openLiteralEditor() {
        const editor = this.modal.fromComponent(MultilangCodeEditorComponent, {
            backdrop: true,
            closeOnOutsideClick: false,
            title: "Edit File Content"
        });

        editor.content.next(this.value.toString());

        if (this.fileName) {
            const nameParts = this.fileName.split(".");
            const ext = nameParts[nameParts.length - 1].toLowerCase();
            if (ACE_MODE_MAP[ext]) {
                editor.language.next(ext);
            }
        }

        editor.action.first().subscribe(action => {
            if (action === "save") {
                // save string
                this.model = new SBDraft2ExpressionModel(this.model.loc, <string> editor.content.value);
                this.onChange(this.model);
            }
            this.modal.close();
        });
    }

    /**
     * Callback for setting string value to model
     * @param str
     */
    private editLiteral(str: number | string) {
        this.model.setValue(str, "string");
        this.onChange(this.model);
    }

    /**
     * Callback for setting or clearing expression value
     * @param action
     * @param event
     */
    private editExpr(action: "clear" | "edit", event: Event): void {

        if (!action) return;

        if (action === "edit") {
            const editor = this.modal.fromComponent(ModelExpressionEditorComponent, {
                backdrop: true,
                closeOnOutsideClick: false,
                title: "Edit Expression"
            });

            editor.readonly = this.readonly;

            editor.model = this.model;
            editor.context = this.context;
            editor.action.first().subscribe(action => {
                if (action === "save") {
                    this.model = new SBDraft2ExpressionModel(this.model.loc, editor.model.serialize());
                    this.model.evaluate(this.context); // to reset validation
                    this.isExpr = this.model.isExpression;
                    this.onChange(this.model);
                }
                this.modal.close();
            });
        }

        if (action === "clear") {
            this.modal.confirm({
                title: "Really Remove?",
                content: `Are you sure that you want to remove this expression?`,
                cancellationLabel: "No, keep it",
                confirmationLabel: "Yes, delete it"
            }).then(() => {
                this.model.setValue("", "string");
                this.model.result = null;
                this.isExpr = false;
                event.stopPropagation();
                this.onChange(this.model);
            }, noop);
        }
    }
}
