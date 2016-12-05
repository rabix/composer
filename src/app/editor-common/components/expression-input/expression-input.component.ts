import {Component, Input, forwardRef} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {Subject} from "rxjs";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ModalService} from "../../../components/modal/modal.service";
import {ModelExpressionEditorComponent} from "../../../editor-common/expression-editor/model-expression-editor.component";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ExpressionInputComponent),
            multi: true
        }
    ],
    template: `
            <div class="expression-input-group clickable"
                 [class.validatable]="isExpr"
                 [class.warning]="model.validation.warnings.length"
                 [class.error]="model.validation.errors.length">
                 
                <i class="fa fa-warning validation-icon"
                    [title]="model.validation.warnings.join('\\n')"
                    *ngIf="model.validation.warnings.length && isExpr"></i>
                <i class="fa fa-times-circle validation-icon" 
                    *ngIf="model.validation.errors.length && isExpr"
                    [title]="model.validation.errors.join('\\n')"></i>
                <b class="validation-icon result"
                    *ngIf="model.result && isExpr"
                    [title]="model.result">E:</b>
                
                <div class="input-group">
                
                    <input class="form-control"
                            #input
                            [value]="value?.toString()"
                            [readonly]="isExpr"
                            (blur)="onTouch()"
                            (click)="editExpr(isExpr ? 'edit' : null, $event)"
                            (change)="editString(input.value)"/>
                        
                    <span class="input-group-btn">
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
export class ExpressionInputComponent extends ComponentBase implements ControlValueAccessor {
    /**
     * Context in which expression should be executed
     */
    @Input()
    public context: any;

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

    /**
     * From ControlValueAccessor
     * Write a new value to the element when initially loading formControl
     * @param obj
     */
    writeValue(obj: ExpressionModel): void {
        if (obj) {
            this.model  = obj;
            this.isExpr = obj.isExpression;
        } else {
            this.model  = new ExpressionModel("");
            this.isExpr = this.model.isExpression;
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

    /**
     * Declaration of change function
     */
    private onChange = noop;

    /**
     * Declaration of touch function
     */
    private onTouch = noop;


    constructor(private expressionSidebarService: ExpressionSidebarService,
                private modal: ModalService) {
        super();
    }

    /**
     * Callback for setting string value to model
     * @param str
     */
    private editString(str: string) {
        this.model.setValue(str, "string");
        this.onChange(this.model);
    }

    /**
     * Callback for setting or clearing expression value
     * @param action
     * @param event
     */
    private editExpr(action: "clear" | "edit", event: Event): void {

        const editor = this.modal.show(ModelExpressionEditorComponent, {
            backdrop: true,
            closeOnOutsideClick: false,
            title: "Edit Expression"
        });

        editor.model = this.model;
        editor.context = this.context;
        editor.action.first().subscribe(action => {
            if(action === "save"){
                this.model.setValue(editor.model.toString(), editor.model.isExpression ? "expression" : "string");
            }
            this.modal.close();
        });


        return;
        if (!action) return;

        if (action === "clear") {
            this.model.setValue("", "string");
            this.model.result = null;
            this.isExpr       = false;
            event.stopPropagation();
            this.onChange(this.model);
        } else {
            const newExpression = new Subject<ExpressionModel>();

            this.expressionSidebarService.openExpressionEditor({
                value: this.model,
                newExpressionChange: newExpression,
                context: this.context
            });

            this.tracked = newExpression.subscribe(val => {
                this.model = val;

                this.isExpr = val.isExpression;
                this.onChange(this.model);
                this.expressionSidebarService.closeExpressionEditor();
            });
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.expressionSidebarService.closeExpressionEditor();
    }
}
