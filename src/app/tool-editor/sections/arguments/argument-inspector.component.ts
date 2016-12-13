import {Component, Input, Output} from "@angular/core";
import {} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup, FormControl, Validators} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandArgumentModel, ExpressionModel} from "cwlts/models/d2sb";

@Component({
    selector: "ct-argument-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)"> 
 
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
             
            
            <!--Separator field-->
            <div class="form-group row">
                <label for="separator" class="col-md-3">Separate:</label>
                <div class="col-md-9">
                    <div class="form-check">
                        <label class="form-check-label">
                            <input formControlName="separator" id="separator" class="form-check-input" type="checkbox">
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
    public input: CommandArgumentModel;

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

        debugger;

        this.form = this.formBuilder.group({
            valueFrom: new FormControl(this.input.valueFrom),
            separator: new FormControl(this.input.separate || false),
            position: new FormControl(this.input.position || 0),
            prefix: new FormControl(this.input.prefix || ''),
        });

        this.tracked = this.form.valueChanges.subscribe(values => this.save.next(values));
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}
