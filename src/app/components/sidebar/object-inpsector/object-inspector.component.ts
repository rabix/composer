import {Component, Input, OnInit} from "@angular/core";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import {BehaviorSubject} from "rxjs";
import {InputProperty} from "../../../models/input-property.model";

require ("./object-inspector.component.scss");

@Component({
    selector: "object-inspector",
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <form class="object-inspector-component">
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
                    <expression-input [inputControl]="objectInspectorForm.controls['expression']">
                    </expression-input>
                </div>
            </form>
    `
})
export class ObjectInspectorComponent implements OnInit {

    /** The object that we are editing */
    @Input()
    private inputModelStream: BehaviorSubject<InputProperty>;

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    /** FormGroup for the ObjectInspector */
    private objectInspectorForm: FormGroup;

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.inputModelStream.subscribe((inputPort: InputProperty) => {
            this.selectedProperty = inputPort;

            this.objectInspectorForm = this.formBuilder.group({
                expression: [this.selectedProperty.value, Validators.compose([Validators.required, Validators.minLength(1)])]
            });

            this.objectInspectorForm.controls["expression"].valueChanges.subscribe(value => {
                this.selectedProperty.value = value;
            });
        });
    }
}
