import {Component, OnInit, Input} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {DataEntrySource} from "../../sources/common/interfaces";
import {logop} from "../../lib/utils.lib";
import {ComponentBase} from "../common/component-base";

@Component({
    selector: 'ct-file-editor',
    template: `
        <div class="editor-container">
        
            <div class="scroll-content">
                <!--Put Code Editor Here-->
            </div>
        </div>
`
})
export class FileEditorComponent extends ComponentBase implements OnInit {
    @Input()
    public data: DataEntrySource;

    private rawEditorContent = new BehaviorSubject("");

    ngOnInit(): void {
        this.tracked = this.data.content.subscribe(this.rawEditorContent);
    }

    private save(){
        if (this.data.data.source === "local") {
            this.data.data.save(this.rawEditorContent.getValue()).subscribe(logop);
        }
    }
}
