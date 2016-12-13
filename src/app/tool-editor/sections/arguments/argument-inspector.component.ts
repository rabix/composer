import {Subject} from "rxjs";
import {Component, Input, Output} from "@angular/core";
import {FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {CommandArgumentModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-argument-inspector",
    template: `
<ct-form-panel [collapsed]="false">

        <span class="tc-header">
            Basic
        </span>
        
        <div class="tc-body">
            <form [formGroup]="form">
            
                <!--Prefix Field-->
                <div class="form-group">
                    <label>Prefix:</label>
                    <input type="text" class="form-control" [formControl]="form.controls['prefix']">
                </div>
                
                <!--Position Field-->
                <div class="form-group">
                    <label>Expression:</label>
                    <ct-expression-input 
                    [context]="context"
                    [formControl]="form.controls['valueFrom']">                    
                    </ct-expression-input>
                </div>
                
                <!--Separator field-->            
                <div class="form-group flex-container">
                    <label>Separator:</label>
                    <span class="align-right">
                        {{form._value.separate? "Yes" : "No"}}
                        <toggle-slider [formControl]="form.controls['separate']"></toggle-slider>
                    </span>
                </div>
                
                <!--Position Field-->
                <div class="form-group">
                    <label>Position:</label>
                    <input type="text" type="number" class="form-control" [formControl]="form.controls['position']">
                </div>
                
            </form>
        </div>
                
</ct-form-panel>
`
})
export class ArgumentInspector extends ComponentBase {

    @Input()
    public argument: CommandArgumentModel;

    private form: FormGroup;

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    @Output()
    public save = new Subject<FormGroup>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            valueFrom: new FormControl(this.argument.valueFrom),
            separate: new FormControl(this.argument.separate || false),
            position: new FormControl(this.argument.position || 0),
            prefix: new FormControl(this.argument.prefix || ''),
        });

        this.tracked = this.form.valueChanges.subscribe(values => this.save.next(values));
    }
}
