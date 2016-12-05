import {Component, Input} from "@angular/core";
import {FormControl} from "@angular/forms";
import {ResourceRequirementModel} from "cwlts/models/d2sb";
import {Output} from "@angular/core";
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
                       [type]="'number'">
        </ct-quick-pick>
        
        <label class="form-control-label">CPU</label>
        <ct-quick-pick [suggestions]="cpuSuggest" 
                       [formControl]="cpuControl"
                       [context]="context"
                       [type]="'number'">
        </ct-quick-pick>
    </div>

</ct-form-panel>

`
})
export class ResourcesComponent {
    @Input()
    entries: {
        "sbg:CPURequirement"?: ResourceRequirementModel,
        "sbg:MemRequirement"?: ResourceRequirementModel
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

    ngOnInit() {
        this.memControl.setValue(this.entries["sbg:MemRequirement"].value);
        this.cpuControl.setValue(this.entries["sbg:CPURequirement"].value);

        this.memControl.valueChanges.subscribe(val => {
            const res = this.entries["sbg:MemRequirement"];
            res.value = val;
            this.update.next(res);
        });

        this.cpuControl.valueChanges.subscribe(val => {
            const res = this.entries["sbg:CPURequirement"];
            res.value = val;
            this.update.next(res);
        });
    }
}