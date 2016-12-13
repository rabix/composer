import {Subject} from "rxjs";
import {Component, Input, Output} from "@angular/core";
import {FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {CommandArgumentModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-argument-inspector",
    template: `
        <form [formGroup]="form"> 
 
            <!--Prefix Field-->
            <div class="form-group row">
                <label for="prefix" class="col-md-3 col-form-label">Prefix:</label>
                <div class="col-md-9">
                    <input formControlName="prefix" class="form-control" id="prefix">
                </div>
            </div>
            
            <!--Expression Field-->
            <div class="form-group row">
                <label for="valueFrom" class="col-md-3 col-form-label">Expression:</label>
                <div class="col-md-9">
                <ct-expression-input formControlName="valueFrom" class="form-control" id="valueFrom"
                    [context]="context"
                    [formControl]="form.controls['valueFrom']">
                </ct-expression-input>
                </div>
            </div>             
            
            <!--Separate field-->
            <div class="form-group row">
                <label for="separate" class="col-md-3">Separate:</label>
                <div class="col-md-9">
                    <div class="form-check">
                        <label class="form-check-label">
                            <input formControlName="separate" id="separate" class="form-check-input" type="checkbox">
                        </label>
                    </div>
                </div>
            </div>   
                    
            <!--Position Field-->
            <div class="form-group row">
                <label for="position" class="col-md-3 col-form-label">Position:</label>
                <div class="col-md-9">
                    <input formControlName="position" type="number" class="form-control" id="position">
                </div>
            </div>
            
        </form>
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
