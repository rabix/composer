import {
    Component,
    Input,
    Output,
    QueryList,
    TemplateRef,
    ViewChildren,
    ChangeDetectorRef
} from "@angular/core";
import {CreateFileRequirementModel, DirentModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-file-def-list",
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Files
            </span>

            <div class="tc-body">


                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !model.listing?.length"
                                     [buttonText]="'Create a file'"
                                     (buttonClick)="addEntry()">
                    Any config or temporary files the tool expects to be present when it executes, that aren’t already present in the Docker
                    container. These files will be created in the tool’s working directory from the text content you specify here.
                </ct-blank-tool-state>

                <div *ngIf="readonly && !model.listing?.length" class="text-xs-center h5">
                    This tool doesn't create any files
                </div>

                <!--List Header Row-->
                <div class="editor-list-title" *ngIf="model.listing?.length">
                    <div class="col-sm-5">Name</div>
                    <div class="col-sm-7">Content</div>
                </div>


                <!--FileDef List Entries-->
                <ul class="editor-list">

                    <!--List Entry-->
                    <li *ngFor="let entry of model.listing; let i = index"
                        class="input-list-items">

                        <div class="editor-list-item clickable"
                             [ct-validation-class]="entry"
                             [ct-editor-inspector]="inspector"
                             [ct-editor-inspector-target]="entry.loc">

                            <!--Name Column-->
                            <div class="col-sm-5 ellipsis">
                                <ct-validation-preview [entry]="entry"></ct-validation-preview>
                                {{ entry.entryName | fileDefName }}
                            </div>

                            <!--Content Column-->
                            <div class="ellipsis" [ngClass]="{
                                'col-sm-6': !readonly,
                                'col-sm-7': readonly
                            }" [title]="entry.entry | fileDefContent">
                                {{ entry.entry | fileDefContent }}
                            </div>

                            <!--Actions Column-->
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i [ct-tooltip]="'Delete'"
                                   class="fa fa-trash text-hover-danger"
                                   (click)="removeEntry(i, $event)"></i>
                            </div>

                        </div>

                        <!--Object Inspector Template -->
                        <ng-template #inspector>
                            <ct-editor-inspector-content>
                                <div class="tc-header">{{ entry.loc || "FileDef" }}</div>
                                <div class="tc-body">
                                    <ct-file-def-inspector
                                            (save)="updateFileDef($event, i)"
                                            [context]="context"
                                            [dirent]="entry"
                                            [readonly]="readonly">
                                    </ct-file-def-inspector>
                                </div>
                            </ct-editor-inspector-content>
                        </ng-template>
                    </li>
                </ul>

                <!--Add entry link-->
                <button *ngIf="!readonly && model.listing?.length"
                        (click)="addEntry()"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add a File
                </button>

            </div>
        </ct-form-panel>
    `
})
export class FileDefListComponent extends DirectiveBase {

    @Input()
    model: CreateFileRequirementModel;

    @Input()
    readonly = false;

    @Input()
    context: { $job: any };

    @Input()
    location = "";

    @Output()
    update = new Subject<DirentModel[]>();

    @ViewChildren("inspector", {read: TemplateRef})
    inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(public inspector: EditorInspectorService, private modal: ModalService, private cdr: ChangeDetectorRef) {
        super();
    }

    addEntry() {
        const newEntry = this.model.addDirent({});
        this.update.next(this.model.listing);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }

    removeEntry(index) {
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this file?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            if (this.inspector.isInspecting(this.model.listing[index].loc)) {
                this.inspector.hide();
            }

            const {entry, entryName} = this.model.listing[index];
            entry.cleanValidity();
            entryName.cleanValidity();
            
            this.model.listing = this.model.listing.slice(0, index).concat(this.model.listing.slice(index + 1));
            this.update.next(this.model.listing);
        }, err => console.warn);

    }

    updateFileDef(newDef: { entryName, entry }, index: number) {
        this.model.listing[index].entryName.setValue(newDef.entryName.serialize(), newDef.entryName.type);
        this.model.listing[index].entry.setValue(newDef.entry.serialize(), newDef.entry.type);

        this.cdr.markForCheck();

        this.update.next(this.model.listing);
    }
}
