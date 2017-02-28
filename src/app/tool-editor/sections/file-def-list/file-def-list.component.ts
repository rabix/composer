import {ChangeDetectionStrategy, Component, Input, Output, QueryList, TemplateRef, ViewChildren, ViewEncapsulation} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {FileDef} from "cwlts/mappings/d2sb/FileDef";
import {FileDefModel} from "cwlts/models/d2sb";
import {Subject} from "rxjs";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {ModalService} from "../../../components/modal/modal.service";
import {noop} from "../../../lib/utils.lib";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-file-def-list",
    styleUrls: ["./file-def-inspector.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Files
            </span>

            <div class="tc-body">

                <div class="container">

                    <!--Blank Tool Screen-->
                    <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                         [title]="'Create temporary files needed for the tools'"
                                         [buttonText]="'Create a file'"
                                         (buttonClick)="addEntry()">
                    </ct-blank-tool-state>

                    <!--List Header Row-->
                    <div class="gui-section-list-title row" *ngIf="entries.length">
                        <div class="col-sm-5">Name</div>
                        <div class="col-sm-7">Content</div>
                    </div>

                    <!--FileDef List Entries-->
                    <ul class="gui-section-list">

                        <!--List Entry-->
                        <li *ngFor="let entry of entries; let i = index"
                            class="input-list-items container">

                            <div class="gui-section-list-item clickable row"
                                 [ct-validation-class]="entry.validation"
                                 [ct-editor-inspector]="inspector"
                                 [ct-editor-inspector-target]="entry.loc">

                                <!--Name Column-->
                                <div class="col-sm-5 ellipsis">
                                    {{ entry?.filename | fileDefName }}
                                </div>

                                <!--Content Column-->
                                <div class="ellipsis" [ngClass]="{
                                'col-sm-6': !readonly,
                                'col-sm-7': readonly
                            }" [title]="entry?.fileContent | fileDefContent">
                                    {{ entry?.fileContent | fileDefContent }}
                                </div>

                                <!--Actions Column-->
                                <div *ngIf="!readonly" class="col-sm-1 align-right">
                                    <i [ct-tooltip]="'Delete'"
                                       class="fa fa-trash text-hover-danger"
                                       (click)="removeEntry(i, $event)"></i>
                                </div>

                            </div>

                            <!--Object Inspector Template -->
                            <template #inspector>
                                <ct-editor-inspector-content>
                                    <div class="tc-header">{{ entry.loc || "FileDef" }}</div>
                                    <div class="tc-body">
                                        <ct-file-def-inspector
                                            (save)="updateFileDef($event, i)"
                                            [context]="context"
                                            [fileDef]="entry"
                                            [readonly]="readonly">
                                        </ct-file-def-inspector>
                                    </div>
                                </ct-editor-inspector-content>
                            </template>
                        </li>
                    </ul>

                </div>

                <!--Add entry link-->
                <button *ngIf="!readonly && entries.length"
                        (click)="addEntry()"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add a File
                </button>
            </div>

        </ct-form-panel>
    `
})
export class FileDefListComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: FileDefModel[] = [];

    @Input()
    public readonly = false;

    @Input()
    public context: { $job: any };

    @Input()
    public location: string = "";

    @Output()
    public update = new Subject<FileDefModel[]>();

    @ViewChildren("inspector", {read: TemplateRef})
    private inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(private inspector: EditorInspectorService, private modal: ModalService) {
        super();
    }

    private addEntry() {
        const newLoc = `${this.location}.fileDef[${this.entries.length}]`;
        const newEntry = new FileDefModel({fileContent: "", filename: ""}, newLoc);
        const entries = this.entries.concat(newEntry);
        this.update.next(entries);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }

    private removeEntry(index) {
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this file?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            if (this.inspector.isInspecting(this.entries[index].loc)) {
                this.inspector.hide();
            }

            this.entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
            this.update.next(this.entries);
        }, noop);

    }

    private updateFileDef(newDef: FileDef, index: number) {
        const input = this.entries[index];
        Object.assign(input, new FileDefModel(newDef));
        this.update.next(this.entries.slice());
    }
}
