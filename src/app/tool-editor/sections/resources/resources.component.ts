import {Component, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {ResourceRequirementModel} from "cwlts/models";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-resources",
    template: `

        <ct-form-panel [collapsed]="false">
    <span class="tc-header">
        Computational Resources
    </span>
            <div class="tc-body">
                <form [formGroup]="form">
                    <label class="form-control-label">Memory (min)</label>
                    <ct-quick-pick data-test="resource-memory"
                                   [suggestions]="memSuggest"
                                   [formControl]="form.controls['mem']"
                                   [context]="context"
                                   [type]="'number'"
                                   [readonly]="readonly">
                    </ct-quick-pick>

                    <label class="form-control-label">CPU (min)</label>
                    <ct-quick-pick data-test="resource-cpu"
                                   [suggestions]="cpuSuggest"
                                   [formControl]="form.controls['cores']"
                                   [context]="context"
                                   [type]="'number'"
                                   [readonly]="readonly">
                    </ct-quick-pick>
                </form>
            </div>
        </ct-form-panel>
    `
})
export class ResourcesComponent extends DirectiveBase implements OnChanges, OnInit {
    @Input()
    entries: ResourceRequirementModel;

    @Input()
    readonly: boolean;

    @Input()
    context: any = {};

    @Output()
    update = new ReplaySubject<any>(1);

    form = new FormGroup({
        mem: new FormControl(),
        cores: new FormControl()
    });

    memSuggest = {
        "100MB": 100,
        "1GB": 1000,
        "2GB": 2000,
        "4GB": 4000,
        "8GB": 8000,
    };

    cpuSuggest = {
        "single-thread": 1,
        "multi-thread": 0
    };

    private custom: any = {};

    ngOnChanges(changes: SimpleChanges) {
        this.custom = this.entries.customProps;
        this.form.controls["mem"].setValue(this.entries.mem, {onlySelf: true});
        this.form.controls["cores"].setValue(this.entries.cores, {onlySelf: true});
    }

    ngOnInit() {
        this.tracked = this.form.valueChanges.subscribe(change => {
            this.update.next({...this.custom, ...change});
        });
    }
}
