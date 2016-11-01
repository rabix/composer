import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditor} from "./code-editor";
import {Component, OnInit, ElementRef, ViewChild, Input, OnDestroy} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {ComponentBase} from "../common/component-base";
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
export class CodeEditorComponent extends ComponentBase implements OnInit, OnDestroy {

    @Input("content")
    public rawInput: Observable<string>;

    @Input()
    public language: Observable<string>;

    @Input()
    public readOnly = false;

    /** Holds the reference to the CodeEditor service/component */
    private editor: CodeEditor;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    constructor() {
        super();
    }

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
    }

    ngOnDestroy(): void {
        this.editor.dispose();
        super.ngOnDestroy();
    }

}
