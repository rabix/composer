import {Component, Input, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-file-editor",
    styleUrls: ["./file-editor.component.scss"],
    template: `
        <ct-action-bar>
            <div class="document-controls">
                <button [disabled]="!data.isWritable" class="btn btn-secondary btn-sm" type="button" (click)="save()">
                    <i class="fa fa-fw fa-save"></i>
                </button>
            </div>
        </ct-action-bar>
        <ct-code-editor [formControl]="fileContent"
                        [filePath]="data.id"
                        [options]="{

                        }"></ct-code-editor>
        <!---->
        <!--<div class="editor-container" [hidden]="isLoading">-->

        <!--<ct-editor-controls>-->
        <!--&lt;!&ndash;Copy&ndash;&gt;-->
        <!--<button class="btn btn-secondary btn-sm" type="button">-->
        <!--Copy...-->
        <!--</button>-->

        <!--&lt;!&ndash;Save&ndash;&gt;-->
        <!--<button [disabled]="!data.isWritable"-->
        <!--(click)="save()"-->
        <!--class="btn btn-secondary btn-sm" type="button">-->
        <!--Save-->
        <!--</button>-->
        <!--</ct-editor-controls>-->

        <!--<div class="editor-content flex-row">-->
        <!--<ct-code-editor-x [(content)]="rawEditorContent"-->
        <!--[language]="data.language"-->
        <!--[options]="{theme: 'ace/theme/monokai'}"></ct-code-editor-x>-->
        <!--</div>-->
        <!--</div>-->
    `
})
export class FileEditorComponent extends DirectiveBase implements OnInit {
    @Input()
    data: AppTabData;

    fileContent = new FormControl(undefined);

    ngOnInit(): void {
        this.fileContent.setValue(this.data.fileContent);
    }

    save() {
        console.log("Saving!");
        // // For local files, just save and that's it
        // if (this.data.data.source === "local") {
        //     const path = this.data.data.path;
        //
        //     const statusID = this.statusBar.startProcess(`Saving ${path}...`, `Saved ${path}`);
        //     this.data.data.save(this.rawEditorContent.getValue()).subscribe(() => {
        //         this.statusBar.stopProcess(statusID);
        //     });
        //     return;
        // }

    }
}
