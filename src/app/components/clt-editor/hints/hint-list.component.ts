import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";

@Component({
    selector: "ct-hint-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <div class="tc-header">
                Hints
            </div>

            <div class="tc-body">

                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Special flags for tool execution'"
                                     [buttonText]="'Add a Hint'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <div *ngIf="entries.length" class="container">
                    <div class="gui-section-list-title row">
                        <div class="col-sm-5">Class</div>
                        <div class="col-sm-7">Value</div>
                    </div>

                    <ul class="gui-section-list row">

                        <li *ngFor="let entry of entries; let i = index"
                            class="gui-section-list-item clickable">

                            <div class="col-sm-5 ellipsis">{{ entry?.class }}</div>

                            <div class="ellipsis col-sm-6" [class.col-sm-7]="readonly">{{ entry?.value }}</div>

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
                    <i class="fa fa-plus"></i> Add Hint
                </button>
            </div>
        </ct-form-panel>
`
})
export class HintListComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: {"class"?: string, value?: string}[] = [];

    @Input()
    public readonly = false;

    private helpLink = ExternalLinks.hints;

    private addEntry() {
        this.entries = this.entries.concat({});
    }

    private removeEntry(index) {
        this.entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
    }
}