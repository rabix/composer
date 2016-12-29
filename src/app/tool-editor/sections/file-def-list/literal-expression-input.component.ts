import {Component, Input, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";
import {ExpressionModel} from "../../../../../node_modules/cwlts/models/d2sb/ExpressionModel";
import {ModalService} from "../../../components/modal/modal.service";
import {ModelExpressionEditorComponent} from "../../../editor-common/expression-editor/model-expression-editor.component";
import {MultilangCodeEditorComponent} from "../../../core/ui/code-editor/multilang-code-editor.component";
import {ACE_MODES_MAP} from "../../../components/code-editor/code-editor-modes-map";

require("./literal-expression-input.component.scss");

@Component({
    selector: 'ct-literal-expression-input',
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
export class LiteralExpressionInputComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    context: {$job?: {}} = {};

    @Input()
    fileName: string;

    /**
     * Declaration of change function
     */
    private onChange = noop;

    /**
     * Declaration of touch function
     */
    private onTouch = noop;

    /** Flag if model is expression or primitive */
    private isExpr: boolean = false;

    /**
     * Internal ExpressionModel on which changes are made
     */
    private model: ExpressionModel;


    /** getter for formControl value */
    public get value() {
        return this.model;
    }

    /** setter for formControl value */
    public set value(val: ExpressionModel) {
        if (val !== this.model) {
            this.model = val;
            this.onChange(val);
        }
    }


    constructor(private modal: ModalService) {
        super();
    }

    writeValue(obj: any): void {
        if (!(obj instanceof ExpressionModel)) {
            console.warn(`ct-literal-expression-input expected ExpressionModel, instead got ${obj}`)
        }

        if (obj) {
            this.model  = obj;
            this.isExpr = obj.isExpression;
        } else {
            this.model  = new ExpressionModel("", "");
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
        const editor = this.modal.show(MultilangCodeEditorComponent, {
            backdrop: true,
            closeOnOutsideClick: false,
            title: "Edit File Content"
        });

        editor.content.next(this.value.toString());

        if (this.fileName) {
            const nameParts = this.fileName.split('.');
            const ext = nameParts[nameParts.length - 1].toLowerCase();
            if (ACE_MODES_MAP[ext]) {
                editor.language.next(ext);
            }
        }

        editor.action.first().subscribe(action => {
            if (action === "save") {
                // save string
                this.model = new ExpressionModel(this.model.loc, <string> editor.content.value);
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
            const editor = this.modal.show(ModelExpressionEditorComponent, {
                backdrop: true,
                closeOnOutsideClick: false,
                title: "Edit Expression"
            });

            editor.model   = this.model;
            editor.context = this.context;
            editor.action.first().subscribe(action => {
                if (action === "save") {
                    this.model = new ExpressionModel(this.model.loc, editor.model.serialize());
                    this.model.evaluate(this.context); // to reset validation
                    this.isExpr = this.model.isExpression;
                    this.onChange(this.model);
                }
                this.modal.close();
            });
        }

        if (action === "clear") {
            this.model.setValue("", "string");
            this.model.result = null;
            this.isExpr       = false;
            event.stopPropagation();
            this.onChange(this.model);
        }
    }
}