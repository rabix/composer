import {Component, Input, ChangeDetectionStrategy, Output, ViewChildren, QueryList, TemplateRef} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {Subject} from "rxjs";
import {ModalService} from "../../../components/modal/modal.service";
import {noop} from "../../../lib/utils.lib";
import {CommandInputParameterModel} from "cwlts/models/generic/CommandInputParameterModel";
import {CommandOutputParameterModel} from "cwlts/models/d2sb";

require("./output-list.component.scss");

@Component({
    selector: "ct-tool-output-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="container">      
                 
                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !entries.length && isField"
                                     [title]="'Click the button to define a field for record.'"
                                     [buttonText]="'Add a field'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>  
                 
                 <!--List Header Row-->
                <div class="gui-section-list-title row" *ngIf="entries.length">
                    <div class="col-sm-4">ID</div>
                    <div class="col-sm-3">Type</div>
                    <div class="col-sm-5">Glob</div>
                </div>
            
                <!--Output List Entries-->
                <ul class="gui-section-list">
                
                    <!--List Entry-->
                    <li *ngFor="let entry of entries; let i = index"
                        class="input-list-items container" 
                        [class.record-input]="isRecordType(entry)">
                        
                        <div class="gui-section-list-item clickable row"
                            [ct-editor-inspector]="inspector"
                            [ct-editor-inspector-target]="entry.loc"
                            [ct-editor-inspector-readonly]="readonly"
                            [ct-validation-class]="entry.validation">
                        
                            <!--ID Column-->
                            <div class="col-sm-4 ellipsis" [title]="entry.id">
                                <ct-validation-preview [entry]="entry.validation"></ct-validation-preview>
                                {{ entry.id }}
                            </div>
                            
                            <!--Type Column-->
                            <div class="col-sm-3 ellipsis" [title]="entry.type">
                                {{ entry.type | commandParameterType }}
                            </div>       
                                                 
                                                 
                             <!--Tooltip for Glob-->
                             <ct-tooltip-content #ctt>
                                <span *ngIf="entry.outputBinding.glob && !entry.outputBinding.glob?.isExpression">
                                    {{ entry.outputBinding.glob.toString() }}
                                </span>
                                
                                <ct-code-preview *ngIf="ctt.isIn && entry.outputBinding.glob && entry.outputBinding.glob?.isExpression"
                                                 (viewReady)="ctt.show()"
                                                 [content]="entry.outputBinding.glob.toString()"></ct-code-preview>
                            </ct-tooltip-content>
                            
                            <!--Glob Column-->
                            <div class="ellipsis"
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'top'"
                                 [ngClass]="{
                                     'col-sm-4': !readonly,
                                     'col-sm-5': readonly
                                 }">
                                 {{ entry.outputBinding.glob}}
                             </div>
                            
                            <!--Actions Column-->
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i [ct-tooltip]="'Delete'"
                                   class="fa fa-trash text-hover-danger"
                                   (click)="removeEntry(i)"></i>
                            </div>
                        
                        </div>
                        
                        <!--Object Inspector Template -->
                        <template #inspector>
                            <ct-editor-inspector-content>
                                <div class="tc-header">{{ entry.id || entry.loc || "Output" }}</div>
                                <div class="tc-body">
                                    <ct-tool-output-inspector 
                                               (save)="updateOutput($event, i)" 
                                               [context]="context"
                                               [output]="entry"
                                               [inputs]="inputs"
                                               [readonly]="readonly">
                                    </ct-tool-output-inspector>
                                </div>
                            </ct-editor-inspector-content>
                        </template>
                        
                        <!--Nested entries-->
                        <div *ngIf="isRecordType(entry)" class="">
                            <ct-tool-output-list [entries]="entry.type.fields"
                                  [readonly]="readonly"
                                  [inputs]="inputs"
                                  [location]="getFieldsLocation(i)"
                                  [isField]="true"
                                  (update)="updateFields($event, i)">  
                            </ct-tool-output-list>    
                        </div>    
                    
                    </li>
                </ul>
        </div>
        
        <!--Add Output Button-->
        <button *ngIf="!readonly && entries.length" 
                (click)="addEntry()" 
                type="button" 
                class="btn pl-0 btn-link no-outline no-underline-hover">
            <i class="fa fa-plus"></i> Add Output
        </button>
     
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

    /** Flag if output is field of a record */
    @Input()
    public isField = false;

    @Output()
    public readonly update = new Subject();

    @ViewChildren("inspector", {read: TemplateRef})
    private inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(private inspector: EditorInspectorService, private modal: ModalService) {
        super();
    }

    private removeEntry(index) {
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this output?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            if (this.inspector.isInspecting(this.entries[index].loc)) {
                this.inspector.hide();
            }

            const entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
            this.update.next(entries);
        }, noop);
    }

    public addEntry() {
        const newEntryLocation = `${this.location}[${this.entries.length}]`;
        const newEntry = new CommandOutputParameterModel(undefined, newEntryLocation);
        newEntry.isField = this.isField;
        newEntry.type.type = "File";
        const entries  = this.entries.concat(newEntry);
        this.update.next(entries);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }

    private getFieldsLocation(index: number) {
        return `${this.location}[${index}].type.fields`;
    }

    private updateFields(newFields, i) {
        const type = this.entries[i].type;
        type.fields = [];
        newFields.forEach(field => {
            field.isField = true;
            type.addField(field)
        });

        this.update.next(this.entries.slice());
    }

    private updateOutput(newInput: CommandOutputParameterModel, index: number) {

        // FIXME: cloning an object ditches its prototype chain, but we need it
        const input = this.entries[index];

        /**
         * FIXME: input parameter type needs to be able to switch references
         * then make {@link CommandParameterTypePipe} pure again.
         */
        Object.assign(input, newInput);

        this.update.next(this.entries.slice());
    }

    private isRecordType (entry) {
        return entry.type.type === 'record' || (entry.type.type === 'array' && entry.type.items === 'record');
    }
}
