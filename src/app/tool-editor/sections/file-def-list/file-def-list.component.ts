import {
    Component,
    Input,
    ChangeDetectionStrategy,
    Output,
    ViewChildren,
    QueryList,
    TemplateRef
} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {FileDef} from "cwlts/mappings/d2sb/FileDef";
import {FileDefModel} from "cwlts/models/d2sb";
import {Subject} from "rxjs";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";

@Component({
    selector: "ct-file-def-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Files
            </span>
            
            <div class="tc-body">
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Create temporary files needed for the tools'"
                                     [buttonText]="'Create a file'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>
                
                <div *ngIf="entries.length" class="container">
                    <div class="gui-section-list-title row">
                        <div class="col-sm-5">Name</div>
                        <div class="col-sm-7">Content</div>
                    </div>
                
                    <ul class="gui-section-list">
                        <li *ngFor="let entry of entries; let i = index"
                            [ct-validation-class]="entry.validation"
                            [ct-editor-inspector]="inspector"
                            [ct-editor-inspector-target]="entry"
                            class="gui-section-list-item clickable validatable row">
                            
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
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(i)"></i>
                            </div>
                            
                             <!--Object Inspector Template -->
                            <template #inspector>
                                <ct-editor-inspector-content>
                                        <div class="tc-header">{{ entry.loc || "FileDef" }}</div>
                                        <div class="tc-body">
                                            <ct-file-def-inspector 
                                                (save)="updateFileDef($event, i)" 
                                                [context]="context"
                                                [fileDef]="entry">
                                            </ct-file-def-inspector>
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
    public context: {$job: any};

    @Input()
    public location: string = "";

    @Output()
    public update = new Subject<FileDefModel[]>();

    @ViewChildren("inspector", {read: TemplateRef})
    private inspectorTemplate: QueryList<TemplateRef<any>>;

    constructor(private inspector: EditorInspectorService) {
        super();
    }

    private addEntry() {
        const newLoc   = `${this.location}.fileDef[${this.entries.length}]`;
        const newEntry = new FileDefModel({fileContent: "", filename: ""}, newLoc);
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

    private removeEntry(index) {
        if (this.inspector.isInspecting(this.entries[index])) {
            this.inspector.hide();
        }

        this.entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
        this.update.next(this.entries);
    }

    private updateFileDef(newDef: FileDef, index: number) {
        const def = this.entries[index];

        console.log("def gotten from inspector", newDef);
        this.entries[index] = new FileDefModel(newDef);

        console.log("def written to entries", this.entries[index]);
        this.update.next(this.entries.slice());
    }
}