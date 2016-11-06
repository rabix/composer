import {Component, Input, forwardRef} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {ExpressionModel} from "cwlts";
import {Subject} from "rxjs";
import {ExpressionSidebarService} from "../../../../services/sidebars/expression-sidebar.service";
import {ComponentBase} from "../../../common/component-base";
import {noop} from "../../../../lib/utils.lib";

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
            <div class="input-group expression-input-group"
                 [class.expr]="isExpr"
                 (click)="editExpr(isExpr ? 'edit' : null, $event)">
                 
                <input class="form-control"
                        #input
                        [value]="value?.toString()"
                        [readonly]="isExpr"
                        (blur)="onTouch()"
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
            this.model = new ExpressionModel("");
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


    constructor(private expressionSidebarService: ExpressionSidebarService) {
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
        if (!action) return;

        if (action === "clear") {
            this.model.setValue("", "string");
            this.isExpr = false;
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
