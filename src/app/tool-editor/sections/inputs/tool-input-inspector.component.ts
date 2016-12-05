import {Component, Input, Output} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-tool-input-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">
        
            <!--ID Field-->
            <div class="form-group row">
                <label for="id" class="col-md-3 col-form-label">ID:</label>
                <div class="col-md-9">
                    <input formControlName="id" class="form-control" id="id">
                </div>
            </div>
            
            <!--Type Field-->
            <div class="form-group row">
                <label for="type" class="col-md-3 col-form-label">Type:</label>
                <div class="col-md-9">
                    <select formControlName="type" class="form-control" id="type">
                        <option *ngFor="let opt of inputTypeOptions" [value]="opt">{{ opt }}</option>
                    </select>
                </div>
            </div>
            
            <!--Required Field-->
            <div class="form-group row">
                <label for="required" class="col-md-3">Required:</label>
                <div class="col-md-9">
                    <div class="form-check">
                        <label class="form-check-label">
                            <input formControlName="required" id="required" class="form-check-input" type="checkbox">
                        </label>
                    </div>
                </div>
            </div>
            
            <!--Include in Command Line Field-->
            <div class="form-group row">
                <label for="include" class="col-md-3">Bound to CL:</label>
                <div class="col-md-9">
                    <div class="form-check">
                        <label class="form-check-label">
                            <input formControlName="include" id="required" class="form-check-input" type="checkbox">
                        </label>
                    </div>
                </div>
            </div>
           
            <!--<div class="form-group row">-->
                <!--<div class="col-xs-12">-->
                    <!--<button type="submit" class="btn btn-primary">Save</button>-->
                <!--</div>-->
            <!--</div>-->
            
            
        </form>
`
})
export class ToolInputInspector extends ComponentBase {

    @Input()
    public input: CommandInputParameterModel;

    private form: FormGroup;

    private inputTypeOptions = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    @Output()
    public save = new Subject<FormGroup>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            id: new FormControl(this.input.id || ""),
            type: new FormControl(this.input.type.type || "string"),
            include: new FormControl(this.input.isBound),

            // FIXME: isNullable is undefined when it's not nullable
            required: new FormControl(!this.input.type.isNullable),
        });


        this.tracked = this.form.valueChanges.subscribe(values => this.save.next(values));
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}