import {Component, EventEmitter, Input, Output, QueryList, TemplateRef, ViewChildren} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {noop} from "rxjs/util/noop";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-input-list",
    template: `
        <div>
            <!--Blank Tool Screen-->
            <ct-blank-state *ngIf="!readonly && !entries.length && isField"
                            [hasAction]="true"
                            [title]="'Click the button to define a field for record.'"
                            [buttonText]="'Add field'"
                            (buttonClick)="addEntry()">
            </ct-blank-state>

            <div *ngIf="readonly && !entries.length" class="text-xs-center">
                This tool doesn't specify any inputs
            </div>

            <!--List Header Row-->
            <div class="editor-list-title" [class.editable]="!readonly" *ngIf="!!entries.length">
                <div class="col-xs-4">ID</div>
                <div class="col-xs-3">Type</div>
                <div class="col-xs-4">Binding</div>
            </div>

            <!--Input List Entries-->
            <ul class="editor-list">

                <!--List Entry-->
                <li *ngFor="let entry of entries; let i = index"
                    class="input-list-items"
                    [class.record-input]="isRecordType(entry)">

                    <!--List item container-->
                    <div class="editor-list-item-container">

                        <!--List item-->
                        <div class="form-control editor-list-item clickable"
                             data-test="input-port"
                             [ct-editor-inspector]="inspector"
                             [ct-editor-inspector-target]="entry.loc"
                             [ct-editor-inspector-readonly]="readonly"
                             [ct-validation-class]="entry">

                            <!--ID Column-->
                            <div class="col-xs-4 ellipsis">
                                <ct-validation-preview
                                        [entry]="entry"></ct-validation-preview>
                                {{ entry.id }}
                            </div>

                            <!--Type Column-->
                            <div class="col-xs-3 ellipsis">
                                {{ entry.type | commandParameterType }}
                            </div>

                            <!--Binding Column-->
                            <div class="col-xs-4 ellipsis" [class.col-xs-5]="readonly">
                                {{ entry.inputBinding | commandInputBinding }}
                            </div>
                        </div>

                        <!--Object Inspector Template -->
                        <ng-template #inspector>
                            <ct-editor-inspector-content>
                                <div class="tc-header">{{ entry.id || entry.loc || "Input" }}</div>
                                <div class="tc-body">
                                    <ct-tool-input-inspector
                                            [model]="model"
                                            [input]="entry"
                                            (save)="updateInput($event, 'inspector')"
                                            [readonly]="readonly">
                                    </ct-tool-input-inspector>
                                </div>
                            </ct-editor-inspector-content>
                        </ng-template>

                        <!--Nested entries-->
                        <div *ngIf="isRecordType(entry)" class="children pl-1 pr-1">
                            <ct-tool-input-list [(entries)]="entry.type.fields"
                                                (update)="updateInput(entry, 'recursive')"
                                                [readonly]="readonly"
                                                [parent]="entry"
                                                [model]="model"
                                                [location]="getFieldsLocation(i)"
                                                [isField]="true">
                            </ct-tool-input-list>
                            <div>
                            </div>
                        </div>
                    </div>

                    <!--Actions Column-->
                    <div *ngIf="!readonly" class="remove-icon">
                        <i [ct-tooltip]="'Delete'"
                           data-test="remove-input-button"
                           class="fa fa-trash clickable"
                           (click)="removeEntry(i)"></i>
                    </div>

                </li>
            </ul>
        </div>

        <!--Add entry link-->
        <button *ngIf="!readonly && !!entries.length"
                (click)="addEntry()"
                type="button"
                class="btn pl-0 btn-link no-outline no-underline-hover"
                data-test="tool-add-input-button-small">
            <i class="fa fa-plus"></i> Add {{ isField ? "a Field" : "an Input" }}
        </button>

    `
})
export class ToolInputListComponent extends DirectiveBase {

    @Input()
    entries: CommandInputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    location = "";

    @Input()
    readonly = false;

    /** Flag if input is field of a record */
    @Input()
    isField = false;

    @Input()
    parent: CommandLineToolModel | CommandInputParameterModel;

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
        this.modal.delete("input").then(() => {
            if (this.inspector.isInspecting(this.entries[index].loc)) {
                this.inspector.hide();
            }

            if (this.isField) {
                (this.parent as CommandInputParameterModel).type.removeField(this.entries[index]);
            } else {
                (this.parent as CommandLineToolModel).removeInput(this.entries[index]);
            }

            this.update.emit(this.model.inputs);
        }, err => console.warn);
    }

    addEntry() {
        let newEntry: CommandInputParameterModel;

        if (this.isField) {
            newEntry = (this.parent as CommandInputParameterModel).type.addField({});
        } else {
            newEntry = (this.parent as CommandLineToolModel).addInput({});
        }

        newEntry.createInputBinding();
        newEntry.isField   = this.isField;
        newEntry.type.type = "File";

        this.update.emit(this.model.inputs);

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

    updateInput(input: CommandInputParameterModel) {
        input.validate(this.model.getContext(input.id)).then(noop, noop);
        this.update.emit(this.model.inputs);
    }
}
