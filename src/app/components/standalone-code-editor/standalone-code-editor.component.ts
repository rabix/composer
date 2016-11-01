import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {Subscription, BehaviorSubject} from "rxjs";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {DataEntrySource} from "../../sources/common/interfaces";

@Component({
    selector: 'ct-standalone-code-editor',
    directives: [CodeEditorComponent],
    template: `
        <div class="editor-container">
            <tool-header class="editor-header"
                         (save)="save($event)"
                         [data]="data"></tool-header>
        
            <div class="scroll-content">
                <ct-code-editor [content]="data.content"
                                [readOnly]="!data.isWritable"
                                [language]="data.language"></ct-code-editor>
            </div>
        </div>
`
})
export class StandaloneCodeEditorComponent implements OnInit, OnDestroy {
    @Input()
    public data: DataEntrySource;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[] = [];

    private rawEditorContent = new BehaviorSubject("");

    ngOnInit(): void {
        this.subs.push(this.data.content.subscribe(this.rawEditorContent));
    }

    private save(){
        if (this.data.data.source === "local") {
            this.data.data.save(this.rawEditorContent.getValue()).subscribe(_ => {
            });
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }
}