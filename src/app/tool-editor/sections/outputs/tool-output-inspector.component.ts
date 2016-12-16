import {Component, Input, Output, OnChanges, SimpleChanges} from "@angular/core";
import {CommandOutputParameterModel, CommandInputParameterModel} from "cwlts/models/d2sb";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-tool-output-inspector",
    template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit(form)">
        
            <basic-output-section [formControl]="form.controls['basicOutputSection']"
                                 [context]="context">
            </basic-output-section>
            
            <output-description [formControl]="form.controls['description']">            
            </output-description>    
                  
            <output-metadata-section [inputs]="inputList" [formControl]="form.controls['metaData']">            
            </output-metadata-section>                  
            
            <output-eval [formControl]="form.controls['outputEval']">            
            </output-eval>   
                     
            <secondary-file [formControl]="form.controls['secondaryFiles']">            
            </secondary-file>
 
        </form>
`
})
export class ToolOutputInspector extends ComponentBase implements OnChanges{

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    @Input()
    public output: CommandOutputParameterModel;

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job?: any, $self?: any} = {};

    private inputList: CommandInputParameterModel[] = [];

    private form: FormGroup;

    @Output()
    public save = new Subject<CommandOutputParameterModel>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const items = ["File", "record"];

        this.inputList = changes["inputs"].currentValue.filter(entry =>
            (items.indexOf(entry.type.type) > -1 ||
            (entry.type.type === 'array' && items.indexOf(entry.type.items) > -1)));
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            basicOutputSection: this.output,
            description: this.output,
            outputEval: this.output,
            metaData: this.output,
            secondaryFiles: this.output || []
        });

        this.tracked = this.form.valueChanges.subscribe(_ => {
            this.save.next(this.output);
        });
    }

    private onSubmit(form: FormGroup) {
        this.save.next(form.value);
    }
}
