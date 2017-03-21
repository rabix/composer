import {
    Component,
    EventEmitter,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChildren
} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {noop} from "../../../lib/utils.lib";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: "ct-tool-input-list",
    template: `
        <div class="container">

            <!--Blank Tool Screen-->
            <ct-blank-tool-state *ngIf="!readonly && !entries.length && isField"
                                 [title]="'Click the button to define a field for record.'"
                                 [buttonText]="'Add field'"
                                 (buttonClick)="addEntry()">
            </ct-blank-tool-state>

            <!--List Header Row-->
            <div class="gui-section-list-title row" *ngIf="entries.length">
                <div class="col-sm-4">ID</div>
                <div class="col-sm-3">Type</div>
                <div class="col-sm-4">Binding</div>
            </div>

            <!--Input List Entries-->
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
                        <div class="col-sm-4 ellipsis">
                            <ct-validation-preview
                                    [entry]="entry.validation"></ct-validation-preview>
                            {{ entry.id }}
                        </div>

                        <!--Type Column-->
                        <div class="col-sm-3 ellipsis">
                            {{ entry.type | commandParameterType }}
                        </div>

                        <!--Binding Column-->
                        <div class="col-sm-4 ellipsis" [class.col-sm-5]="readonly">
                            {{ entry.inputBinding | commandInputBinding }}
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
                            <div class="tc-header">{{ entry.id || entry.loc || "Input" }}</div>
                            <div class="tc-body">
                                <ct-tool-input-inspector
                                        [context]="context"
                                        [input]="entry"
                                        (save)="entriesChange.emit(entries)"
                                        [readonly]="readonly">
                                </ct-tool-input-inspector>
                            </div>
                        </ct-editor-inspector-content>
                    </template>

                    <div *ngIf="isRecordType(entry)" class="children">
                        <ct-tool-input-list [(entries)]="entry.type.fields"
                                            (entriesChange)="entriesChange.emit(entries)"
                                            [readonly]="readonly"
                                            [parent]="entry"
                                            [location]="getFieldsLocation(i)"
                                            [isField]="true">
                        </ct-tool-input-list>
                    </div>

                </li>
            </ul>
        </div>

        <!--Add entry link-->
        <button *ngIf="!readonly && entries.length"
                (click)="addEntry()"
                type="button"
                class="btn pl-0 btn-link no-outline no-underline-hover">
            <i class="fa fa-plus"></i> Add an Input
        </button>

    `
})
export class ToolInputListComponent extends DirectiveBase {

    @Input()
    public entries: CommandInputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job: any };

    @Input()
    public readonly = false;

    /** Flag if input is field of a record */
    @Input()
    public isField = false;

    @Input()
    public parent: CommandLineToolModel | CommandInputParameterModel;

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
            content: `Are you sure that you want to remove this input?`,
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
        let newEntry: CommandInputParameterModel;

        if (this.isField) {
            newEntry = (this.parent as CommandInputParameterModel).type.addField({})
        } else {
            newEntry = (this.parent as CommandLineToolModel).addInput({})
        }

        newEntry.createInputBinding();
        newEntry.isField   = this.isField;
        newEntry.type.type = "File";

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
