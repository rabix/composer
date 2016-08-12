import {Component, Input, DoCheck, OnChanges} from "@angular/core";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import * as _ from "lodash";
import {BehaviorSubject} from "rxjs";
import {InputProperty} from "../../../models/input-property.model";

require ("./object-inpsector.component.scss");

@Component({
    selector: "object-inspector",
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <form class="object-inspector-component">
                <div class="formHead">
                     <span class="edit-text">Edit</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <div class="form-group">
                    <label for="inputId">ID</label>
                    <input type="text" 
                           name="inputId" 
                           class="form-control"
                           [(ngModel)]="selectedProperty.id">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    
                    <select class="form-control" 
                    name="dataType"
                    [(ngModel)]="selectedProperty.type" required>
                        <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                            {{propertyType}}
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="inputValue">Value</label>
                    <expression-input [inputControl]="objectInspectorForm.controls['expression']"
                                      [(expression)]="selectedProperty.value">
                    </expression-input>
                </div>
            </form>
    `
})
export class ObjectInspectorComponent implements DoCheck, OnChanges {

    /** The object that we are editing */
    @Input()
    private inputModelStream: BehaviorSubject<InputProperty>;

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    /** A copy of the property for change detection */
    private oldProperty: InputProperty;

    private objectInspectorForm: FormGroup;

    /** Possible property types */
    private propertyTypes: Array<string> = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    constructor(private formBuilder: FormBuilder) {
        this.objectInspectorForm = this.formBuilder.group({
            expression: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });
    }

    /** This gets triggered when a data-bound input property value changes, i.e. when we change the inputModelStream. */
    ngOnChanges(): void {
        this.inputModelStream.subscribe((inputPort: InputProperty) => {
            this.selectedProperty = inputPort;
        });
    }

    /** Custom change detection needed for objects */
    ngDoCheck(): void {
        if (!_.isEqual(this.selectedProperty, this.oldProperty)) {
            this.oldProperty = _.cloneDeep(this.selectedProperty);
            this.inputModelStream.next(this.selectedProperty)
        }
    }
}
