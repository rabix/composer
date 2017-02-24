import {Component, Input, SimpleChanges, Output, OnChanges} from "@angular/core";
import {FormControl} from "@angular/forms";
import {ResourceRequirementModel, ExpressionModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";

@Component({
    selector: "ct-resources",
    template: `

<ct-form-panel [collapsed]="false">
    <span class="tc-header">
        Resources
    </span>

    <div class="tc-body">
    
        <label class="form-control-label">Memory</label>
        <ct-quick-pick [suggestions]="memSuggest" 
                       [formControl]="memControl"
                       [context]="context"
                       [type]="'number'"
                       [readonly]="readonly">
        </ct-quick-pick>
        
        <label class="form-control-label">CPU</label>
        <ct-quick-pick [suggestions]="cpuSuggest" 
                       [formControl]="cpuControl"
                       [context]="context"
                       [type]="'number'"
                       [readonly]="readonly">
        </ct-quick-pick>
    </div>

</ct-form-panel>

`
})
export class ResourcesComponent implements OnChanges {
    @Input()
    entries: {
        cpu?: ResourceRequirementModel,
        mem?: ResourceRequirementModel
    };

    @Input()
    readonly: boolean;

    @Input()
    context: {$job?: any, $self?: any};

    @Output()
    update = new ReplaySubject<any>();

    private memControl = new FormControl();
    private cpuControl = new FormControl();

    private memSuggest = {
        "100MB": 100,
        "1GB": 1000,
        "2GB": 2000,
        "4GB": 4000,
        "8GB": 8000,
    };
    private cpuSuggest = {
        "single-thread": 1,
        "multi-thread": 0
    };

    ngOnChanges(changes: SimpleChanges) {
        this.memControl.setValue(changes["entries"].currentValue.mem ? changes["entries"].currentValue.mem.value : "");
        this.cpuControl.setValue(changes["entries"].currentValue.cpu ? changes["entries"].currentValue.cpu.value : "");
    }

    ngOnInit() {
        this.memControl.valueChanges.filter(val => {
            return val !== this.entries.mem.value;
        }).subscribe(value => {
            if (!(value instanceof ExpressionModel)) {
                value = new ExpressionModel("", value);
            }
            const res = new ResourceRequirementModel({
                    "class": "sbg:MemRequirement",
                    value
                }, "");
            res.value = value;
            this.update.next(res);
        });

        this.cpuControl.valueChanges.filter(val => {
            return val !== this.entries.cpu.value;
        }).subscribe(value => {
            if (value === this.entries.cpu.value) return;

            if (!(value instanceof ExpressionModel)) {
                value = new ExpressionModel("", value);
            }
            const res = new ResourceRequirementModel({
                    "class": "sbg:CPURequirement",
                    value
                }, "");
            res.value = value;
            this.update.next(res);
        });
    }
}
