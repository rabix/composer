import {ChangeDetectorRef, Component, Input, OnInit, Output, QueryList, TemplateRef, ViewChildren} from "@angular/core";
import {CommandLineToolModel, CreateFileRequirementModel, DirentModel, ExpressionModel} from "cwlts/models";
import {ErrorCode} from "cwlts/models/helpers/validation/ErrorCode";
import {Subject} from "rxjs/Subject";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-file-def-list",
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                File Requirements
            </span>

            <div class="tc-body">

                <!--Blank Tool Screen-->
                <ct-blank-state *ngIf="!readonly && !fileRequirement.listing?.length" (buttonClick)="addDirent()"
                                [learnMoreURL]="'http://docs.rabix.io/the-tool-editor#files'"
                                [hasAction]="true">
                    <section tc-button-text>Create a File</section>
                    <section tc-description>
                        Set config files or temporary files needed for the tool to execute properly if these files
                        are not already present in the Docker container. These files will be created in the tool’s
                        working directory from the text content you specify here.
                    </section>

                    <section tc-content *ngIf="!isSBDraft2">

                        <!--In case that tool is not draft2 then show dropdown for adding items-->
                        <ct-generic-dropdown-menu [ct-menu]="menu" #addItemDropDown>
                            <button class="btn btn-primary" data-test="file-requirement-add-button" type="button" (click)="addItemDropDown.toggleMenu()">
                                Add
                            </button>
                        </ct-generic-dropdown-menu>

                        <!--Template for add item dropdown -->
                        <ng-template #menu class="mr-1">
                            <ul class="list-unstyled" (click)="addItemDropDown.hide()">
                                <li data-test="file-option" (click)="addDirent()">
                                    File
                                </li>

                                <li data-test="expression-option" (click)="addExpression()">
                                    Expression
                                </li>
                            </ul>
                        </ng-template>
                    </section>
                </ct-blank-state>

                <div *ngIf="readonly && !fileRequirement.listing?.length" class="text-xs-center ">
                    No file requirements are specified for this tool
                </div>

                <!--FileDef List Entries-->
                <ul class="editor-list">

                    <!--List Entry-->
                    <li *ngFor="let entry of fileRequirement.listing; let i = index"
                        class="input-list-items">

                        <!--If entry is ExpressionModel-->
                        <ct-expression-input
                            *ngIf="isExpressionModel(entry); else notExpressionModel"
                            [context]="context"
                            [ngModel]="entry"
                            (ngModelChange)="onExpressionEntryChanges()"
                            [readonly]="readonly">
                        </ct-expression-input>

                        <!--If entry is Dirent Model-->
                        <ng-template #notExpressionModel>

                            <!--List item-->
                            <div class="editor-list-item clickable form-control"
                                 data-test="file-def"
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
                            </div>
                        </ng-template>

                        <!--Actions Column-->
                        <div *ngIf="!readonly" class="remove-icon">
                            <i [ct-tooltip]="'Delete'"
                               class="fa fa-trash clickable"
                               data-test="remove-file-def-button"
                               (click)="removeEntry(entry, i)"></i>
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

                <!--Add item link-->
                <ng-container *ngIf="!readonly && fileRequirement.listing?.length">

                    <!--If draft2 show button-->
                    <button *ngIf="isSBDraft2; else v1Template" (click)="addDirent()"
                            type="button"
                            class="btn pl-0 btn-link no-outline no-underline-hover"
                            data-test="tool-add-file-button-small">
                        <i class="fa fa-plus"></i> Add a File
                    </button>

                    <!--If not draft2 show dropdown for adding items-->
                    <ng-template #v1Template>
                        <ct-generic-dropdown-menu [ct-menu]="menu" #addItemDropDown>
                            <button type="button" 
                                    (click)="addItemDropDown.toggleMenu()"
                                    data-test="tool-add-file-button-small"
                                    class="btn pl-0 btn-link no-outline no-underline-hover">
                                <i class="fa fa-plus"></i> Add
                            </button>
                        </ct-generic-dropdown-menu>

                        <!--Template for add item dropdown -->
                        <ng-template #menu class="mr-1">
                            <ul class="list-unstyled" (click)="addItemDropDown.hide()">
                                <li (click)="addDirent()" data-test="tool-v1-add-file">
                                    File
                                </li>

                                <li (click)="addExpression()" data-test="tool-v1-add-expression">
                                    Expression
                                </li>
                            </ul>
                        </ng-template>
                    </ng-template>

                </ng-container>

            </div>
        </ct-form-panel>
    `
})
export class FileDefListComponent extends DirectiveBase implements OnInit {

    @Input()
    model: CommandLineToolModel;

    @Input()
    fileRequirement: CreateFileRequirementModel;

    @Input()
    readonly = false;

    @Input()
    context: { $job: any };

    @Input()
    location = "";

    @Output()
    update = new Subject<Array<DirentModel | ExpressionModel>>();

    @ViewChildren("inspector", {read: TemplateRef})
    inspectorTemplate: QueryList<TemplateRef<any>>;

    isSBDraft2;

    constructor(public inspector: EditorInspectorService, private modal: ModalService, private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnInit(): void {
        this.isSBDraft2 = this.model.cwlVersion === "sbg:draft-2";
    }

    addDirent() {

        const newEntry = this.fileRequirement.addDirent({});
        this.update.next(this.fileRequirement.listing);

        this.inspectorTemplate.changes
            .take(1)
            .delay(1)
            .map(list => list.last)
            .subscribe(templateRef => {
                this.inspector.show(templateRef, newEntry.loc);
            });
    }

    addExpression() {

        this.fileRequirement.addExpression("");
        this.update.next(this.fileRequirement.listing);
    }

    removeEntry(entryFromList: DirentModel | ExpressionModel, index: number) {

        const listing = this.fileRequirement.listing;

        this.modal.delete("file requirement").then(() => {
            if (this.inspector.isInspecting(listing[index].loc)) {
                this.inspector.hide();
            }

            if (entryFromList instanceof ExpressionModel) {
                entryFromList.clearIssue(ErrorCode.ALL);
            } else if (entryFromList instanceof DirentModel) {

                const {entry, entryName} = entryFromList;
                entry.clearIssue(ErrorCode.ALL);
                entryName.clearIssue(ErrorCode.ALL);

            }

            this.fileRequirement.listing = listing.slice(0, index).concat(listing.slice(index + 1));
            this.update.next(this.fileRequirement.listing);
        }, err => console.warn);

    }

    updateFileDef(newDef: { entryName, entry }, index: number) {
        this.fileRequirement.listing[index]["entryName"].setValue(newDef.entryName.serialize(), newDef.entryName.type);
        this.fileRequirement.listing[index]["entry"].setValue(newDef.entry.serialize(), newDef.entry.type);

        this.cdr.markForCheck();
        this.update.next(this.fileRequirement.listing);
    }

    isExpressionModel(entry: DirentModel | ExpressionModel) {
        return entry instanceof ExpressionModel;
    }

    onExpressionEntryChanges() {
        this.update.next(this.fileRequirement.listing);
    }
}
