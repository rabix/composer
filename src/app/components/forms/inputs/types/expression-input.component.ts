import {Component, Input, Output, EventEmitter, forwardRef} from "@angular/core";
import {AbstractControl, NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {ExpressionModel} from "cwlts";
import {ReplaySubject, Subject} from "rxjs";
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
            <div class="input-group"
                 [class.expression-input-group]="isExpr"
                 (click)="edit(isExpr ? 'edit' : null, $event)"
                 *ngIf="control">
                <input class="form-control"
                        #input
                        [value]="control.value?.toString()"
                        [readonly]="isExpr"
                        (blur)="touch()"
                        (change)="editString(input.value)"/>
                    
                <span class="input-group-btn">
                    <button type="button"
                        class="btn btn-secondary" 
                        [disabled]="disableEdit"
                        (click)="edit(isExpr ? 'clear' : 'edit', $event)">
                        <i class="fa"
                            [ngClass]="{'fa-times': isExpr,
                                        'fa-code': !isExpr}"></i>
                    </button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent extends ComponentBase implements ControlValueAccessor {
    private model: ExpressionModel;


    // get value() {
    //     return this.model;
    // }
    //
    // set value(val: ExpressionModel) {
    //     this.model = val;
    //     this.propagateChange(val);
    // }

    writeValue(obj: ExpressionModel): void {
        this.model = obj;
    }

    propagateChange = noop;

    touch = noop;

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
        // triggering changed value
    }

    registerOnTouched(fn: any): void {
        this.touch = fn;
        // triggering on touched, I expect
        // call this.touch if you want to set form to touch
    }

    private isExpr: boolean = false;

    private editString(str: string) {
        this.control.value.setValue(str, "string");
    }

    @Input()
    public control: AbstractControl;

    @Input()
    public disableEdit: boolean;

    @Input()
    public isExpression: boolean;

    @Input()
    public context: any;

    @Output()
    /** @deprecated*/
    public onEdit = new EventEmitter();

    @Output()
    /** @deprecated*/
    public onClear = new EventEmitter();

    constructor(private expressionSidebarService: ExpressionSidebarService) {
        super();
    }

    ngOnInit() {
        this.isExpr = this.control.value ? this.control.value.isExpression : false;
    }

    private edit(action: "clear" | "edit", event: Event): void {
        if (!action) return;

        if (action === "clear") {
            this.control.value.setValue("", "string");
            this.isExpr = false;
            event.stopPropagation();
        } else {
            const newExpression = new Subject<ExpressionModel>();

            this.expressionSidebarService.openExpressionEditor({
                value: this.control.value,
                newExpressionChange: newExpression,
                context: this.context
            });

            this.tracked = newExpression.subscribe(val => {
                this.control.setValue(val);

                this.isExpr = val.isExpression;
                this.expressionSidebarService.closeExpressionEditor();
            });
        }
    }
}
