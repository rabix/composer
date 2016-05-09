import {Component, OnInit} from '@angular/core';
import Editor = AceAjax.Editor;
import TextMode = AceAjax.TextMode;
import {ElementRef} from "@angular/core";
import {CodeEditor} from "./code-editor.service";

require('./code-editor.component.scss');

require('brace/theme/monokai');
require('brace/mode/javascript');

@Component({
    selector: 'code-editor',
    inputs: ['text'],
    template: `<div class="code-editor-container">
                    <div id="code_editor" class="editor"></div>
               </div>`
})
export class CodeEditorComponent implements OnInit {
    editor: CodeEditor;
    
    constructor(private elem: ElementRef) {}

    ngOnInit():any {
        let editorInstance = ace.edit(this.elem.nativeElement.getElementsByClassName('editor')[0]);
        this.editor = new CodeEditor(editorInstance);
    }

    ngOnDestroy():any {
        this.editor.dispose();
    }
}