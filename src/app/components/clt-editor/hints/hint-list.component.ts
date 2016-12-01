import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";
import {ExpressionModel} from "cwlts/models/d2sb";

@Component({
    selector: "ct-hint-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <div class="tc-header">
                Hints
            </div>

            <div class="tc-body">

                <ct-blank-tool-state *ngIf="!readonly && !hints.length"
                                     [title]="'Special flags for tool execution'"
                                     [buttonText]="'Add a Hint'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <div *ngIf="hints.length" class="container">
                    <div class="gui-section-list-title row">
                        <div class="col-sm-5">Class</div>
                        <div class="col-sm-7">Value</div>
                    </div>

                    <ul class="gui-section-list row">

                        <li *ngFor="let entry of hints; let i = index"
                            class="gui-section-list-item clickable">

                            <div class="col-sm-5 ellipsis">{{ entry?.class }}</div>

                            <div class="ellipsis col-sm-6" [class.col-sm-7]="readonly">{{ entry?.value?.toString() }}</div>

                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(i)"></i>
                            </div>
                        </li>

                    </ul>
                </div>

                <button *ngIf="!readonly && hints.length"
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
    public entries: {[id:string]: {"class"?: string, value?: string}};

    private hints: {"class"?: string, value?: string|ExpressionModel}[] = [];

    @Input()
    public readonly = false;

    private helpLink = ExternalLinks.hints;

    private addEntry() {
        this.hints = this.hints.concat({});
    }

    ngOnInit(): void {
        this.hints = Object.keys(this.entries).map(key => this.entries[key]);
    }

    private removeEntry(index) {
        this.hints = this.hints.slice(0, index).concat(this.hints.slice(index + 1));
    }
}