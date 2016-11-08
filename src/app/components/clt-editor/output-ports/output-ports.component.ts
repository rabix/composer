import {Component, Input} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import {OutputPortsService} from "./output-ports.service";
import {ListEntryComponent} from "../controls/list-entry.component";
import {GuidService} from "../../../services/guid.service";
import {ComponentBase} from "../../common/component-base";

@Component({
    selector: "ct-output-ports",
    providers: [OutputPortsService],
    directives: [ListEntryComponent],
    template: `
        <ct-form-section>
            <div class="tc-header">Output Ports</div>
            <div class="tc-body">
                <form [formGroup]="formGroup">
                
                    <div *ngIf="entries.length === 0">
                        No output ports have been set yet.
                    </div>
         
                    <div *ngIf="entries.length" class="gui-section-list-title">
                        <div class="col-sm-4">Glob</div>
                        <div class="col-sm-3">ID</div>
                        <div class="col-sm-5">Type</div>
                    </div>
                
                    <ul class="gui-section-list">
                        <li *ngFor="let entry of entries; let i = index"
                            class="gui-section-list-item clickable">
                
                            <div class="col-sm-4 ellipsis" [title]="entry?.glob">{{ entry?.glob }}</div>
                
                            <div class="col-sm-3 ellipsis" [title]="entry?.id">{{ entry?.id }}</div>
                            
                            <div class="col-sm-3 ellipsis" [title]="entry?.type">{{ entry?.type}}</div>
                
                            <div class="col-sm-2 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(entry)"></i>
                            </div>
                        </li>
                    </ul>
                    
                    <button (click)="addEntry()" type="button" class="btn btn-link pull-right no-outline no-underline-hover">
                        <i class="fa fa-plus"></i> Add Input
                    </button>
                </form>
            </div>
        
        </ct-form-section>
    `
})
export class OutputPortsComponent extends ComponentBase {

    @Input()
    public formGroup: FormGroup;

    /** Streams the list of entries that should be shown */
    private entries = [];

    /** Holds the references to the temporary form control names */
    private controlStore = new Map();

    constructor(private guid: GuidService) {
        super();
    }

    ngOnInit() {
        // Map form control value map onto the iterable entry list
        this.tracked = this.formGroup
            .valueChanges
            .map(controlSet => Object.keys(controlSet).map(key => controlSet[key]))
            .subscribe(list => this.entries = list);
    }

    private addEntry() {
        const data = {id: Math.random()};
        const key  = this.guid.generate();

        this.controlStore.set(data, key);
        this.formGroup.addControl(key, new FormControl(data));
    }

    private removeEntry(entry) {
        this.formGroup.removeControl(this.controlStore.get(entry));
        this.controlStore.delete(entry);
    }
}