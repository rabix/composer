import {Component, Input} from "@angular/core";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";

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
                           [(ngModel)]="data.id">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    
                    <!--TODO: add a list of possible types -->
                    <select class="form-control">
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="inputValue">Value</label>
                    <expression-input [inputControl]="objectInspectorForm.controls['expression']"
                                      [expression]="data.value">
                    </expression-input>
                </div>
            </form>
    `
})
export class ObjectInspectorComponent {

    /** The object that we are editing */
    @Input()
    private data: Object;

    private objectInspectorForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.objectInspectorForm = this.formBuilder.group({
            expression: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });
    }
}
