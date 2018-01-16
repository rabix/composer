import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ExpressionModel} from "cwlts/models";
import {ModelExpressionEditorComponent} from "../../../editor-common/expression-editor/model-expression-editor.component";
import {noop} from "../../../lib/utils.lib";
import {ACE_MODE_MAP} from "../../../ui/code-editor-new/ace-mode-map";
import {MultilangCodeEditorComponent} from "../../../ui/code-editor/multilang-code-editor.component";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

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
             [class.expr]="model?.isExpression"
             [ct-validation-class]="model">

            <ct-validation-preview [entry]="model"></ct-validation-preview>
            <b class="validation-icon result"
               *ngIf="model?.isExpression && !model?.errors.length && !model?.warnings.length"
               [title]="model.result">E:</b>

            <div class="textarea-btn-group">

                    <textarea class="form-control"
                              data-test="literal-expr-textarea"
                              #input
                              [readonly]="model?.isExpression"
                              (blur)="onTouch()"
                              [value]="model?.toString() || ''"
                              (click)="editExpr(model?.isExpression ? 'edit' : null, $event)"
                              (change)="editLiteral(input.value)"></textarea>

                <span class="btn-group">
                        <button type="button"
                                (click)="openLiteralEditor()"
                                [disabled]="model.isExpression"
                                data-test="expand-literal-expr-button"
                                class="btn btn-secondary">
                            <i class="fa fa-expand"></i>
                        </button>
                        <button type="button"
                                class="btn btn-secondary"
                                data-test="edit-literal-expr-button"
                                [disabled]="readonly"
                                (click)="editExpr(model?.isExpression ? 'clear' : 'edit', $event)">
                            <i class="fa"
                               [ngClass]="{'fa-times': model?.isExpression,
                                            'fa-code': !model?.isExpression}"></i>
                        </button>
                    </span>
            </div>
        </div>
    `
})
export class LiteralExpressionInputComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    context: any = {};

    @Input()
    fileName: string;

    @Input()
    readonly = false;

    /**
     * Declaration of change function
     */
    private onChange = noop;

    /**
     * Declaration of touch function
     */
    onTouch = noop;

    /**
     * Internal ExpressionModel on which changes are made
     */
    model: ExpressionModel;

    constructor(private modal: ModalService) {
        super();
    }

    writeValue(obj: any): void {
        if (!(obj instanceof ExpressionModel)) {
            console.warn(`ct-literal-expression-input expected ExpressionModel, instead got ${obj}`);
        }

        if (obj) {
            this.model  = obj;
        } else {
            console.warn("supposed to get a value, but didn't... :(");
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    openLiteralEditor() {
        const editor = this.modal.fromComponent(MultilangCodeEditorComponent, {
            backdrop: true,
            closeOnOutsideClick: false,
            closeOnEscape: false,
            title: "Edit File Content"
        });

        editor.content.next(this.model.toString());

        if (this.fileName) {
            const nameParts = this.fileName.split(".");
            const ext       = nameParts[nameParts.length - 1].toLowerCase();
            if (ACE_MODE_MAP[ext]) {
                editor.language.next(ACE_MODE_MAP[ext]);
            }
        }

        editor.submit.first().subscribe(() => {
            // save string
            this.model.setValue(editor.content.value, "string");
            this.onChange(this.model);

            this.modal.close();
        });
    }

    /**
     * Callback for setting string value to model
     * @param str
     */
    editLiteral(str: number | string) {
        this.model.setValue(str, "string");
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
                title: "Expression Editor"
            });

            editor.readonly = this.readonly;

            editor.model   = this.model.clone();
            editor.context = this.context;
            editor.submit.first().subscribe(() => {

                const val = editor.model.serialize();

                if (!val) {
                    editor.model.setValue("", "string");
                }

                this.model.cloneStatus(editor.model);

                this.modal.close();
            });
        }

        if (action === "clear") {
            this.modal.delete("expression").then(() => {
                this.model.setValue("", "string");
                event.stopPropagation();
            }, err => console.warn);
        }
    }
}
