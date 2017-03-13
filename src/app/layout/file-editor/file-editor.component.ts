import {Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {DataEntrySource} from "../../sources/common/interfaces";
import {StatusBarService} from "../status-bar/status-bar.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-file-editor",
    host: {
        "class": "tab-container"
    },
    template: `
        <block-loader *ngIf="isLoading"></block-loader>

        <div class="editor-container" [hidden]="isLoading">

            <ct-editor-controls>
                <!--Copy-->
                <button class="btn btn-secondary btn-sm" type="button">
                    Copy...
                </button>

                <!--Save-->
                <button [disabled]="!data.isWritable"
                        (click)="save()"
                        class="btn btn-secondary btn-sm" type="button">
                    Save
                </button>
            </ct-editor-controls>

            <div class="editor-content flex-row">
                <ct-code-editor-x [(content)]="rawEditorContent"
                                  [language]="data.language"
                                  [options]="{theme: 'ace/theme/monokai'}"></ct-code-editor-x>
            </div>
        </div>
    `
})
export class FileEditorComponent extends DirectiveBase implements OnInit {
    @Input()
    public data: DataEntrySource;

    private rawEditorContent = new BehaviorSubject("");

    constructor(private statusBar: StatusBarService) {
        super();
    }

    ngOnInit(): void {
        this.tracked = this.data.content.subscribe(this.rawEditorContent);
    }

    private save() {
        // For local files, just save and that's it
        if (this.data.data.source === "local") {
            const path = this.data.data.path;

            const statusID = this.statusBar.startProcess(`Saving ${path}...`, `Saved ${path}`);
            this.data.data.save(this.rawEditorContent.getValue()).subscribe(() => {
                this.statusBar.stopProcess(statusID);
            });
            return;
        }

    }
}
