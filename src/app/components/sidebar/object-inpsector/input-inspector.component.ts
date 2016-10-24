import {Component, OnInit, OnDestroy} from "@angular/core";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import {ExpressionModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService} from "../../../services/sidebars/input-sidebar.service";
import {Subject} from "rxjs/Subject";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {BehaviorSubject} from "rxjs";
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {SandboxService, SandboxResponse} from "../../../services/sandbox/sandbox.service";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <form class="input-inspector-component object-inspector" *ngIf="selectedProperty">
                <div>
                     <span class="edit-text">Edit</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <div class="form-group">
                    <label for="inputId">ID</label>
                    <input type="text" 
                           name="selectedPropertyId" 
                           id="inputId" 
                           class="form-control"
                           [(ngModel)]="selectedProperty.id">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    
                    <select class="form-control" 
                    name="selectedPropertyType" 
                    id="dataType"
                    [(ngModel)]="selectedProperty.type" required>
                        <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                            {{propertyType}}
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Value</label>
                    
                    <expression-input *ngIf="expressionInputForm && expressionInputForm.controls['expressionInput']"
                                    [(expression)]="expressionInput"
                                    [control]="expressionInputForm.controls['expressionInput']"
                                    (onSelect)="addExpression()">
                    </expression-input>
                    
                </div>
            </form>
    `
})
export class InputInspectorComponent implements OnInit, OnDestroy {

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    private inputBinding: Subject<string | Expression> = new Subject<string | Expression>();

    private expressionInput: ExpressionModel = new ExpressionModel({});

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    private subs: Subscription[];

    private expressionInputSub: Subscription;

    private expressionInputForm: FormGroup;

    private sandboxService: SandboxService;

    constructor(private formBuilder: FormBuilder,
                private inputSidebarService: InputSidebarService,
                private expressionSidebarService: ExpressionSidebarService) {
        this.subs = [];
        this.sandboxService = new SandboxService();
    }

    ngOnInit(): void {
        this.subs.push(
            this.inputSidebarService.inputPortDataStream.subscribe((input: InputProperty) => {
                this.selectedProperty = input;
                this.inputBinding.next(this.selectedProperty.getValueFrom());
            })
        );

        this.subs.push(
            this.inputBinding
                .mergeMap((expression: string | Expression) => {
                    let codeToEvaluate: string = "";
                    if ((<Expression>expression).script) {
                        codeToEvaluate = (<Expression>expression).script;
                        this.expressionInput.setValueToExpression(codeToEvaluate);
                    } else {
                        codeToEvaluate = <string>expression;
                        this.expressionInput.setValueToString(codeToEvaluate);
                    }

                    return this.sandboxService.submit(codeToEvaluate)
                })
                .subscribe((result: SandboxResponse) => {
                    if (result.error) {
                        this.expressionInput.setEvaluatedValue(this.expressionInput.getExpressionScript());
                    } else {
                        this.expressionInput.setEvaluatedValue(this.sandboxService.getValueFromSandBoxResponse(result));
                    }
                    this.createExpressionInputForm(this.expressionInput.getEvaluatedValue());
                })
        );
    }

    private addExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((newExpression: ExpressionModel) => {
                if ((<Expression>newExpression.serialize()).script) {
                    this.selectedProperty.setValueFrom(newExpression.serialize());
                    this.expressionInput = newExpression;
                    this.createExpressionInputForm(this.expressionInput.getEvaluatedValue())
                } else {
                    this.inputBinding.next(newExpression.serialize());
                }
            });

        this.expressionSidebarService.openExpressionEditor({
            expression: this.expressionInput.getExpressionScript(),
            newExpressionChange: newExpression
        });
    }

    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    private createExpressionInputForm(formValue: string) {

        if (this.expressionInputForm && this.expressionInputForm.controls['expressionInput']) {
            this.expressionInputForm.controls['expressionInput'].setValue(formValue);
        } else {
            this.expressionInputForm = this.formBuilder.group({
                ['expressionInput']: [formValue, Validators.compose([Validators.required, Validators.minLength(1)])]
            });

            const inputValueChange = this.expressionInputForm.controls['expressionInput'].valueChanges.subscribe((value) => {
                if (typeof this.expressionInput.serialize() === "string") {
                    this.expressionInput.setValueToString(value);
                    this.expressionInput.setEvaluatedValue(value);

                    this.selectedProperty.setValueFrom(value);
                }
            });

            this.subs.push(inputValueChange);
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
