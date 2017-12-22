import {Component, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChildren} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel, CommandOutputParameterModel} from "cwlts/models";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {noop} from "../../../lib/utils.lib";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-output-list",
    template: `
        <div>
            <!--Blank Tool Screen-->
            <ct-blank-state *ngIf="!readonly && !entries.length && isField"
                            [hasAction]="true"
                            [title]="'Click the button to define a field for record.'"
                            [buttonText]="'Add a field'"
                            (buttonClick)="addEntry()">
            </ct-blank-state>

            <div *ngIf="readonly && !entries.length" class="text-xs-center">
                This tool doesn't specify any outputs
            </div>

            <!--List Header Row-->
            <div class="editor-list-title" [class.editable]="!readonly" *ngIf="!!entries.length">
                <div class="col-xs-4">ID</div>
                <div class="col-xs-3">Type</div>
                <div class="col-xs-5">Glob</div>
            </div>

            <!--Output List Entries-->
            <ul class="editor-list">

                <!--List Entry-->
                <li *ngFor="let entry of entries; let i = index"
                    class="input-list-items"
                    [class.record-input]="isRecordType(entry)">

                    <!--List item container-->
                    <div class="editor-list-item-container">

                        <!--List item-->
                        <div class="form-control editor-list-item clickable"
                             data-test="output-port"
                             [ct-editor-inspector]="inspector"
                             [ct-editor-inspector-target]="entry.loc"
                             [ct-editor-inspector-readonly]="readonly"
                             [ct-validation-class]="entry">

                            <!--ID Column-->
                            <div class="col-xs-4 ellipsis" [title]="entry.id">
                                <ct-validation-preview
                                        [entry]="entry"></ct-validation-preview>
                                {{ entry.id }}
                            </div>

                            <!--Type Column-->
                            <div class="col-xs-3 ellipsis" [title]="entry.type">
                                {{ entry.type | commandParameterType }}
                            </div>


                            <!--Tooltip for Glob-->
                            <ct-tooltip-content #ctt>
                                <span *ngIf="entry.outputBinding.glob && !entry.outputBinding.glob?.isExpression">
                                    {{ entry.outputBinding.glob.toString() }}
                                </span>

                                <ct-code-preview
                                        *ngIf="ctt.isIn && entry.outputBinding.glob && entry.outputBinding.glob?.isExpression"
                                        (viewReady)="ctt.show()"
                                        [content]="entry.outputBinding.glob.toString()"></ct-code-preview>
                            </ct-tooltip-content>

                            <!--Glob Column-->
                            <div class="ellipsis"
                                 [ct-tooltip]="ctt"
                                 [tooltipPlacement]="'top'"
                                 [ngClass]="{
                                     'col-xs-4': !readonly,
                                     'col-xs-5': readonly
                                 }">
                                {{ entry.outputBinding.glob | commandOutputGlob}}
                            </div>
                        </div>

                        <!--Object Inspector Template -->
                        <ng-template #inspector>
                            <ct-editor-inspector-content>
                                <div class="tc-header">{{ entry.id || entry.loc || "Output" }}</div>
                                <div class="tc-body">
                                    <ct-tool-output-inspector
                                            (save)="updateOutput(entry)"
                                            [context]="context"
                                            [model]="model"
                                            [output]="entry"
                                            [inputs]="inputs"
                                            [readonly]="readonly">
                                    </ct-tool-output-inspector>
                                </div>
                            </ct-editor-inspector-content>
                        </ng-template>

                        <!--Nested entries-->
                        <div *ngIf="isRecordType(entry)" class="children pl-1 pr-1">
                            <ct-tool-output-list [(entries)]="entry.type.fields"
                                                 (update)="updateOutput(entry)"
                                                 [readonly]="readonly"
                                                 [inputs]="inputs"
                                                 [parent]="entry"
                                                 [model]="model"
                                                 [location]="getFieldsLocation(i)"
                                                 [isField]="true">
                            </ct-tool-output-list>
                        </div>
                    </div>

                    <!--Actions Column-->
                    <div *ngIf="!readonly" class="remove-icon">
                        <i [ct-tooltip]="'Delete'"
                           data-test="output-port-remove"
                           class="fa fa-trash clickable"
                           (click)="removeEntry(i)"></i>
                    </div>
                </li>
            </ul>
        </div>

        <!--Add Output Button-->
        <button *ngIf="!readonly && !!entries.length"
                (click)="addEntry()"
                type="button"
                class="btn pl-0 btn-link no-outline no-underline-hover"
                data-test="tool-add-output-button-small">
            <i class="fa fa-plus"></i> Add {{ isField ? "a Field" : "an Output" }}
        </button>

    `
})
export class ToolOutputListComponent extends DirectiveBase {

    @Input()
    inputs: CommandInputParameterModel[] = [];

    @Input()
    entries: CommandOutputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    location = "";

    /** Context in which expression should be evaluated */
    @Input()
    context: { $job: any };

    @Input()
    readonly = false;

    /** Flag if output is field of a record */
    @Input()
    isField = false;

    @Input()
    parent: CommandLineToolModel | CommandOutputParameterModel;

    @Input()
    model: CommandLineToolModel;

    @Output()
    readonly update = new EventEmitter();

    @ViewChildren("inspector", {read: TemplateRef})
    inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(public inspector: EditorInspectorService, private modal: ModalService) {
        super();
    }

    removeEntry(index) {
        this.modal.delete("output").then(() => {
            if (this.inspector.isInspecting(this.entries[index].loc)) {
                this.inspector.hide();
            }

            if (this.isField) {
                (this.parent as CommandOutputParameterModel).type.removeField(this.entries[index]);
            } else {
                (this.parent as CommandLineToolModel).removeOutput(this.entries[index]);
            }

            this.update.emit(this.model.outputs);
        }, err => console.warn);
    }

    addEntry() {
        let newEntry;

        if (this.isField) {
            newEntry = (this.parent as CommandOutputParameterModel).type.addField({});
        } else {
            newEntry = (this.parent as CommandLineToolModel).addOutput({});
        }
        newEntry.isField       = this.isField;
        newEntry.type.type     = "File";

        this.update.emit(this.model.outputs);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }

    getFieldsLocation(index: number) {
        return `${this.location}[${index}].type.fields`;
    }

    isRecordType(entry) {
        return entry.type.type === "record" || (entry.type.type === "array" && entry.type.items === "record")
            && entry.type.fields;
    }

    updateOutput() {
        this.update.emit(this.model.outputs);
    }
}
