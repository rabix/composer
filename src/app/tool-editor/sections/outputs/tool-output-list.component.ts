import {Component, Input, ChangeDetectionStrategy, Output, ViewChildren, QueryList, TemplateRef} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {ExternalLinks} from "../../../cwl/external-links";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {CommandOutputParameterModel, CommandInputParameterModel} from "cwlts/models/d2sb";
import {Subject} from "rxjs";

require("./output-list.component.scss");

@Component({
    selector: "ct-tool-output-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Outputs
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
                
                    <ul class="gui-section-list">
                        <li *ngFor="let entry of entries; let i = index"
                            [ct-editor-inspector]="inspector"
                            [ct-editor-inspector-target]="entry"
                            [ct-validation-class]="entry.validation"
                            class="gui-section-list-item clickable row">
                            
                            <div class="col-sm-4 ellipsis" [title]="entry.id">
                                <ct-validation-preview [entry]="entry.validation"></ct-validation-preview>
                                {{ entry.id }}
                            </div>
                            <div class="col-sm-3 ellipsis" [title]="entry.type">
                                {{ entry.type | commandParameterType }}
                            </div>
                            
                             <ct-tooltip-content #ctt>
                                <span *ngIf="entry.outputBinding.glob && !entry.outputBinding.glob?.isExpression">
                                    {{ entry.outputBinding.glob.toString() }}
                                </span>
                                
                                <ct-code-preview *ngIf="ctt.isIn && entry.outputBinding.glob && entry.outputBinding.glob?.isExpression"
                                                 (viewReady)="ctt.show()"
                                                 [content]="entry.outputBinding.glob.toString()"></ct-code-preview>
                            </ct-tooltip-content>
                            
                            <div class="ellipsis"
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'top'"
                                 [ngClass]="{
                                     'col-sm-4': !readonly,
                                     'col-sm-5': readonly
                                 }">
                                 {{ entry.outputBinding.glob | commandOutputGlob }}
                             </div>
                            
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(i)"></i>
                            </div>
                            
                            <!--Object Inspector Template -->
                            <template #inspector>
                                <ct-editor-inspector-content>
                                    <div class="tc-header">Output</div>
                                    <div class="tc-body">
                                        <ct-tool-output-inspector 
                                                   (save)="updateOutput($event, i)" 
                                                   [context]="context"
                                                   [output]="entry"
                                                   [inputs]="inputs">
                                        </ct-tool-output-inspector>
                                    </div>
                                </ct-editor-inspector-content>
                            </template>
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
export class ToolOutputListComponent extends ComponentBase {

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    @Input()
    public entries: CommandOutputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    @Input()
    public readonly = false;

    @Output()
    public readonly update = new Subject();

    @ViewChildren("inspector", {read: TemplateRef})
    private inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(private inspector: EditorInspectorService) {
        super();
    }

    private helpLink = ExternalLinks.toolOutput;


    private removeEntry(index) {

        if (this.inspector.isInspecting(this.entries[index])) {
            this.inspector.hide();
        }

        const entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
        this.update.next(entries);
    }

    private addEntry() {
        const newEntryLocation = `${this.location}[${this.entries.length}]`;
        const newEntry = new CommandOutputParameterModel(undefined, newEntryLocation);
        const entries  = this.entries.concat(newEntry);
        this.update.next(entries);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry);
            });
    }

    private updateOutput(newInput: CommandOutputParameterModel, index: number) {
        debugger;

        // FIXME: cloning an object ditches its prototype chain, but we need it
        const input = this.entries[index];

        /**
         * FIXME: input parameter type needs to be able to switch references
         * then make {@link CommandParameterTypePipe} pure again.
         */
        Object.assign(input, newInput);

        this.update.next(this.entries.slice());
    }

}
