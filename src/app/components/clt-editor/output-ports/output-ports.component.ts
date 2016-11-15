import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";

@Component({
    selector: "ct-output-ports",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Output Ports
            </span>
            
            <div class="tc-body">
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Everything your tool generates as a result'"
                                     [buttonText]="'Add an Output'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>
                
                <div *ngIf="entries.length" class="container">
                    <div class="gui-section-list-title row">
                        <div class="col-sm-4">ID</div>
                        <div class="col-sm-3">Type</div>
                        <div class="col-sm-5">Glob</div>
                    </div>
                
                    <ul class="gui-section-list row">
                        <li *ngFor="let entry of entries; let i = index"
                            class="gui-section-list-item clickable validatable">
                            
                            <div class="col-sm-4 ellipsis" [title]="entry?.id">{{ entry?.id }}</div>
                            <div class="col-sm-3 ellipsis" [title]="entry?.type">
                                {{ entry?.type | commandParameterType }}
                            </div>
                            <div class="ellipsis" [ngClass]="{
                                'col-sm-4': !readonly,
                                'col-sm-5': readonly
                            }" >{{ entry?.outputBinding?.glob | commandOutputGlob }}</div>
                            
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(i)"></i>
                            </div>
                        </li>
                    </ul>
                
                </div>
            
                
                <button *ngIf="!readonly && entries.length" 
                        (click)="addEntry()" 
                        type="button" 
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add Output
                </button>
            </div>
        </ct-form-panel>
    `
})
export class OutputPortsComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: {
        id?: string,
        type?: any,
        outputBinding?: {
            glob: any
        }
    }[] = [];

    @Input()
    public readonly = false;

    private helpLink = ExternalLinks.toolOutput;

    constructor() {
        super();
    }

    private addEntry() {
        this.entries = this.entries.concat({});
    }

    private removeEntry(index) {
        this.entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
    }
}