import {Component, Input, ChangeDetectionStrategy, Output} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {Subject} from "rxjs";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";

require("./input-list.component.scss");

@Component({
    selector: "ct-tool-input-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Inputs
            </span>
            
            <div class="tc-body">
                
                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Tool Inputs'"
                                     [buttonText]="'Add an Input'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>
                
                <!--Input List Block-->
                <div *ngIf="entries.length" class="container">
                
                    <!--List Header Row-->
                    <div class="gui-section-list-title row">
                        <div class="col-sm-4">ID</div>
                        <div class="col-sm-4">Type</div>
                        <div class="col-sm-4">Binding</div>
                    </div>
                
                    <!--Input List Entries-->
                    <ul class="gui-section-list">
                    
                        <!--List Entry-->
                        <li *ngFor="let entry of entries; let i = index"
                            [ct-editor-inspector]="inspector"
                            [ct-editor-inspector-target]="entry"
                            class="gui-section-list-item clickable validatable row">
                            
                            <!--ID Column-->
                            <div class="col-sm-4 ellipsis">
                                {{ entry.id }}
                            </div>
                            
                            <!--Type Column-->
                            <div class="col-sm-4 ellipsis">
                                {{ entry.type | commandParameterType }}
                            </div>
                            
                            <!--Binding Column-->
                            <div class="col-sm-3 ellipsis" [class.col-sm-4]="readonly">
                                {{ entry.inputBinding | commandInputBinding }}
                            </div>
                            
                            <!--Actions Column-->
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i [ct-tooltip]="'Delete'"
                                   class="fa fa-trash text-hover-danger" 
                                   (click)="removeEntry(i)"></i>
                            </div>
                            
                            <!--Object Inspector Template -->
                            <template #inspector>
                                <ct-editor-inspector-content>
                                    <div class="tc-header">Input</div>
                                    <div class="tc-body">
                                        <ct-tool-input-inspector 
                                            (save)="updateInput($event, i)" 
                                            [input]="entry">
                                        </ct-tool-input-inspector>
                                    </div>
                                </ct-editor-inspector-content>
                            </template>
                        </li>
                    </ul>
                </div>
            
                <!--Add Input Button-->
                <button *ngIf="!readonly && entries.length" 
                        (click)="addEntry()" 
                        type="button" 
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add an Input
                </button>
            </div>
        </ct-form-panel>
    `
})
export class ToolInputListComponent extends ComponentBase {

    @Input()
    public entries: CommandInputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    @Input()
    public readonly = false;

    @Output()
    public readonly update = new Subject();

    constructor(private inspector: EditorInspectorService) {
        super();
    }

    private removeEntry(index) {

        if (this.inspector.isInspecting(this.entries[index])) {
            this.inspector.hide();
        }

        const entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
        this.update.next(entries);
    }

    private addEntry() {

        const newEntryLocation = `${this.location}[${this.entries.length}]`;
        const newEntry = new CommandInputParameterModel(newEntryLocation, {type: "string"});
        const entries  = this.entries.concat(newEntry);
        this.update.next(entries);
    }

    private updateInput(form: {id: string, required: boolean, type: string, include: boolean}, index: number) {


        // FIXME: cloning an object ditches its prototype chain, but we need it
        const input = this.entries[index];
        input.id    = form.id;

        /**
         * FIXME: input parameter type needs to be able to switch references
         * then make {@link CommandParameterTypePipe} pure again.
         */
        Object.assign(input.type, {
            isNullable: !form.required
        });

        input.type.setType(form.type as any);

        this.update.next(this.entries.slice());
    }
}
