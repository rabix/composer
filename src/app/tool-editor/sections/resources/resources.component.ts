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
    
        <ct-quick-pick [suggestions]="memSuggest" 
                       [formControl]="memControl"
                       [type]="'number'">
        </ct-quick-pick>
        
        <ct-quick-pick [suggestions]="cpuSuggest" 
                       [formControl]="cpuControl"
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
        if (this.entries["sbg:MemRequirement"].value) {
            let mem = this.entries["sbg:MemRequirement"].value;
            if (mem.type !== "expression") mem = mem.value;
            this.memControl.setValue(mem);
        }
        if (this.entries["sbg:CPURequirement"].value) {
            let cpu = this.entries["sbg:CPURequirement"].value;
            if (cpu.type !== "expression") cpu = cpu.value;
            this.cpuControl.setValue(cpu);
        }

        this.memControl.valueChanges.subscribe(val => {
            this.update.next(Object.assign({}, this.entries["sbg:MemRequirement"].serialize(), {value: val}));
        });

        this.cpuControl.valueChanges.subscribe(val => {
            this.update.next(Object.assign({}, this.entries["sbg:CPURequirement"].serialize(), {value: val}));
        });
    }
}