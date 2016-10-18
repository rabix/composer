import {Component, OnInit, OnDestroy} from "@angular/core";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import {ExpressionModel} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService} from "../../../services/sidebars/input-sidebar.service";
import {Subject} from "rxjs/Subject";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {BehaviorSubject} from "rxjs";
import {InputPropertyViewModel} from "../../../services/input-port/input-port.service";

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
                           [(ngModel)]="selectedProperty.inputProperty.id">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    
                    <select class="form-control" 
                    name="selectedPropertyType" 
                    id="dataType"
                    [(ngModel)]="selectedProperty.inputProperty.type" required>
                        <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                            {{propertyType}}
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Value</label>
                    
                    <expression-input *ngIf="expressionInputForm.controls['expressionInput']"
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
    private selectedProperty: InputPropertyViewModel;

    private inputBinding: Subject<string | ExpressionModel> = new Subject<string | ExpressionModel>();

    private expressionInput: ExpressionModel | string;

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    private subs: Subscription[];

    private expressionInputSub: Subscription;

    private expressionInputForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private inputSidebarService: InputSidebarService,
                private expressionSidebarService: ExpressionSidebarService) {
        this.subs = [];
    }

    ngOnInit(): void {
        this.subs.push(
            this.inputSidebarService.inputPortDataStream.subscribe((inputVm: InputPropertyViewModel) => {
                this.selectedProperty = inputVm;
                this.inputBinding.next(<ExpressionModel>this.selectedProperty.inputProperty.getValueFrom());
            })
        );

        this.subs.push(
            this.inputBinding.subscribe((expressionModel: ExpressionModel | string) => {
                let formValue: string = "";
                this.expressionInput = expressionModel;

                if ((<ExpressionModel>expressionModel).script) {
                    formValue = this.selectedProperty.value;
                } else if (typeof expressionModel === "string") {
                    formValue = expressionModel;
                }

                if (this.expressionInputForm && this.expressionInputForm.controls['expressionInput']) {
                    this.expressionInputForm.controls['expressionInput'].setValue(formValue);
                } else {
                    this.expressionInputForm = this.formBuilder.group({
                        ['expressionInput']: [this.expressionInput, Validators.compose([Validators.required, Validators.minLength(1)])]
                    });
                }

                this.expressionInputForm.controls['expressionInput'].valueChanges.subscribe((value) => {
                    if (typeof this.expressionInput === "string") {
                        this.selectedProperty.value = value;
                        this.selectedProperty.inputProperty.setValueFrom(value);
                    }
                });

            })
        );
    }

    private addExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        let expression: string = "";

        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((newExpression: ExpressionModel | string) => {
                if ((<ExpressionModel>newExpression).expressionValue) {
                    this.selectedProperty.value = (<ExpressionModel>newExpression).expressionValue;
                    this.selectedProperty.inputProperty.setValueFrom((<ExpressionModel>newExpression).getCwlModel());
                }
                this.inputBinding.next(newExpression);
            });

        //TODO: (Mate) re-factor after adding method to avoid IF statement
        if ((<ExpressionModel>this.expressionInput).script) {
            expression = (<ExpressionModel>this.expressionInput).script;
        } else if (typeof this.expressionInput === "string") {
            expression = <string>this.expressionInput;
        }

        this.expressionSidebarService.openExpressionEditor({
            expression: expression,
            newExpressionChange: newExpression
        });
    }

    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
