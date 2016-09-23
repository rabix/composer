import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {
    Validators,
    FormBuilder,
    FormGroup,
    REACTIVE_FORM_DIRECTIVES,
    FORM_DIRECTIVES,
    FormControl
} from "@angular/forms";
import {ExpressionInputComponent, ExpressionInputType} from "../../forms/inputs/types/expression-input.component";
import {BehaviorSubject} from "rxjs";
import {CommandInputParameterModel as InputProperty} from "cwlts/lib/models/d2sb";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {UpdateInputPortExpression} from "../../../action-events/index";
import {Subscription} from "rxjs/Subscription";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <form class="input-inspector-component object-inspector">
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
                    <label for="inputValue">Value</label>
                    
                    <expression-input [inputControl]="inputInspectorForm.controls['expression']"
                                    [expressionType]="expressionInputType">
                    </expression-input>
               
                </div>
            </form>
    `
})
export class InputInspectorComponent implements OnInit, OnDestroy {

    /** The object that we are editing */
    @Input()
    public inputModelStream: BehaviorSubject<InputProperty>;

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    /** FormGroup for the ObjectInspector */
    private inputInspectorForm: FormGroup;

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    private expressionInputType: ExpressionInputType = "inputPortValue";

    private subs: Subscription[];

    constructor(private formBuilder: FormBuilder,
                private eventHubService: EventHubService) {
        this.subs = [];
    }

    ngOnInit() {
        let inputModelStreamUpdate = this.inputModelStream.subscribe((inputPort: InputProperty) => {
            this.selectedProperty = inputPort;

            this.inputInspectorForm = this.formBuilder.group({
                expression: [this.selectedProperty.getValueFrom(), Validators.compose([Validators.required, Validators.minLength(1)])]
            });
        });

        this.inputInspectorForm.controls["expression"].valueChanges.subscribe(value => {
            this.selectedProperty.setValueFrom(value);
        });

        this.listenToInputPortUpdate();

        this.subs.push(inputModelStreamUpdate);
    }

    private listenToInputPortUpdate(): void {

        let updateInputPortExpression = this.eventHubService.onValueFrom(UpdateInputPortExpression)
            .subscribe((expression: string) => {
                const expressionControl: FormControl = <FormControl>this.inputInspectorForm.controls['expression'];
                expressionControl.setValue(expression);
            });

        this.subs.push(updateInputPortExpression);
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
