import {Component, OnInit, ElementRef} from "@angular/core";
import {CodeEditor} from "./code-editor.service";
import Editor = AceAjax.Editor;
import TextMode = AceAjax.TextMode;

require('./code-editor.component.scss');

require('brace/theme/monokai');
require('brace/mode/javascript');

@Component({
    selector: 'code-editor',
    inputs: ['text'],
    template: `<div class="code-editor-container">
                    <div class="editor"></div>
               </div>`
})
export class CodeEditorComponent implements OnInit {
    editor: CodeEditor;

    constructor(private elem: ElementRef) {
    }

    ngOnInit(): any {
        let editorInstance = ace.edit(this.elem.nativeElement.getElementsByClassName('editor')[0]);
        this.editor        = new CodeEditor(editorInstance);
    }

    ngOnDestroy(): any {
        this.editor.dispose();
    }

    public setState(state){
        console.log("Setting", state);
    }
}
