import {Component, Input, OnInit} from "@angular/core";
import {
    Validators,
    FormBuilder,
    FormGroup,
    FormControl,
    REACTIVE_FORM_DIRECTIVES,
    FORM_DIRECTIVES
} from "@angular/forms";
import {ExpressionInputComponent, ExpressionInputType} from "../types/expression-input.component";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {UpdateBaseCommandExpression} from "../../../../action-events/index";

require("./form.components.scss");

@Component({
    selector: 'base-command-form',
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
             <form [formGroup]="baseCommandForm">
                <fieldset class="form-group">
                      <button type="button" class="btn btn-secondary hide-btn">Hide</button>
               
                        <label>Base Command</label>
                        <label class="secondary-label">What command do you want to call from the image</label>
                        
                        <expression-input [inputControl]="baseCommandForm.controls['baseCommand']"
                                          [expressionType]="expressionInputType">
                        </expression-input>
                        
                    <button type="button" class="btn btn-secondary add-input-btn">Add base command</button>
                </fieldset>
             </form>
    `
})
export class BaseCommandFormComponent implements OnInit {
    @Input()
    public baseCommand: string;

    /** The parent forms group */
    @Input()
    public group: FormGroup;

    private baseCommandForm: FormGroup;

    private expressionInputType: ExpressionInputType = "baseCommand";

    constructor(private formBuilder: FormBuilder,
                private eventHubService: EventHubService) { }

    ngOnInit(): void {
        this.baseCommandForm = this.formBuilder.group({
            baseCommand: [this.baseCommand, Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        this.baseCommandForm.controls['baseCommand'].valueChanges.subscribe(value => {
            this.baseCommand = value;
        });

        this.group.addControl('baseCommand', this.baseCommandForm.controls['baseCommand']);

        this.eventHubService.onValueFrom(UpdateBaseCommandExpression)
            .subscribe((expression: string) => {
                const baseCommandControl: FormControl = <FormControl>this.baseCommandForm.controls['baseCommand'];
                
                //TODO: update the actual model
                baseCommandControl.updateValue(expression);
            });
    }
}
