import {
    Component,
    EventEmitter,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChildren
} from "@angular/core";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {noop} from "../../../lib/utils.lib";
import {
    CommandInputParameterModel,
    CommandLineToolModel,
    CommandOutputParameterModel
} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: "ct-tool-output-list",
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
                            <ct-validation-preview
                                    [entry]="entry.validation"></ct-validation-preview>
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
                                        (save)="entriesChange.emit(entries)"
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
                        <ct-tool-output-list [(entries)]="entry.type.fields"
                                             (entriesChange)="entriesChange.emit(entries)"
                                             [readonly]="readonly"
                                             [inputs]="inputs"
                                             [parent]="entry"
                                             [location]="getFieldsLocation(i)"
                                             [isField]="true">
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
export class ToolOutputListComponent extends DirectiveBase {

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    @Input()
    public entries: CommandOutputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job: any };

    @Input()
    public readonly = false;

    /** Flag if output is field of a record */
    @Input()
    public isField = false;

    @Input()
    public parent: CommandLineToolModel | CommandOutputParameterModel;

    @Output()
    public readonly entriesChange = new EventEmitter();

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
            this.entriesChange.emit(entries);
        }, noop);
    }

    public addEntry() {
        let newEntry;

        if (this.isField) {
            newEntry = (this.parent as CommandOutputParameterModel).type.addField({});
        } else {
            newEntry = (this.parent as CommandLineToolModel).addOutput({});
        }
        newEntry.isField       = this.isField;
        newEntry.type.type     = "File";

        this.entriesChange.emit(this.entries);

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

    private isRecordType(entry) {
        return entry.type.type === "record" || (entry.type.type === "array" && entry.type.items === "record");
    }
}
