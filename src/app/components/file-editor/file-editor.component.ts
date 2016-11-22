import {Component, OnInit, Input} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {DataEntrySource} from "../../sources/common/interfaces";
import {logop} from "../../lib/utils.lib";
import {ComponentBase} from "../common/component-base";

@Component({
    selector: 'ct-file-editor',
    directives: [CodeEditorComponent],
    template: `
        <div class="editor-container">
            <tool-header class="editor-header"
                         (save)="save($event)"
                         [data]="data"></tool-header>
        
            <div class="scroll-content">
                 <ct-code-editor [content]="rawEditorContent"
                             [readonly]="!data.isWritable"
                             [language]="data.language | async"></ct-code-editor>
        
            </div>
        </div>
`
})
export class FileEditorComponent extends ComponentBase implements OnInit {
    @Input()
    public data: DataEntrySource;

    private rawEditorContent = new BehaviorSubject("");

    private saveSubscription: Subscription;

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.tracked = this.data.content.subscribe(this.rawEditorContent);
    }

    private save() {
        this.clearSaveSubscription();

        if (this.data.data.source === "local") {
           this.saveSubscription = this.data.data.save(this.rawEditorContent.getValue()).subscribe(logop);
        }
    }

    private clearSaveSubscription(): void {
        if (!!this.saveSubscription) {
            this.saveSubscription.unsubscribe();
        }
    }

    ngOnDestroy(): void {
        this.clearSaveSubscription();
        super.ngOnDestroy();
    }
}
