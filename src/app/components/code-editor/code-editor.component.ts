import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditor} from "./code-editor";
import {Component, OnInit, ElementRef, ViewChild, Input, OnDestroy, Output} from "@angular/core";
import {Subscription, Observable, Subject} from "rxjs/Rx";
import Editor = AceAjax.Editor;
import TextMode = AceAjax.TextMode;

require('./code-editor.component.scss');

@Component({
    selector: 'ct-code-editor',
    directives: [BlockLoaderComponent],
    template: `
        <div class="code-editor-container">
             <div #ace class="editor"></div>
        </div>
     `
})
export class CodeEditorComponent implements OnInit, OnDestroy {

    @Input("content")
    public rawInput: Observable<string>;

    @Input()
    public language: Observable<string>;

    @Input()
    public readOnly = false;

    @Output()
    public contentChanges = new Subject<string>();

    /** Holds the reference to the CodeEditor service/component */
    private editor: CodeEditor;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[] = [];

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    ngOnInit(): any {

        // Instantiate the editor and give it the stream through which the file will come through
        this.editor = new CodeEditor(
            ace.edit(this.aceContainer.nativeElement),
            this.rawInput,
            this.language,
            {
                readOnly: this.readOnly
            }
        );

        this.subs.push(this.rawInput.subscribe((text) => {
            this.editor.setText(text);
        }));

        this.subs.push(this.editor.contentChanges.subscribe(this.contentChanges));
    }

    ngOnDestroy(): void {
        this.editor.dispose();
        this.subs.forEach(sub => sub.unsubscribe());
    }

}
