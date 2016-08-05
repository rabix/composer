import {Component} from "@angular/core";
import {ExpressionInputComponent} from "../forms/inputs/types/expression-input.component";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";

require ("./object-inpsector.component.scss");

/** TODO: make this switch between an expression editor and an object inspector*/
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
                    <input type="text" id="inputId" class="form-control">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    <select class="form-control">
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="inputValue">Value</label>
                    <expression-input [inputControl]="objectInspectorForm.controls['expression']"
                                      [expression]="propertyValue">
                    </expression-input>
                </div>
            </form>
    `
})
export class ObjectInspectorComponent {

    /** The value of the property that we are editing */
    private propertyValue: string;

    private objectInspectorForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.objectInspectorForm = this.formBuilder.group({
            expression: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });
    }
}
