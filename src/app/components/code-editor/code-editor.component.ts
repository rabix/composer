import {Component, OnInit, ElementRef} from "@angular/core";
import {CodeEditor} from "./code-editor.service";
import Editor = AceAjax.Editor;
import TextMode = AceAjax.TextMode;
import {FileRegistry, File} from "../../services/file-registry.service";

require('./code-editor.component.scss');

@Component({
    selector: 'code-editor',
    inputs: ['text'],
    template: `<div class="code-editor-container">
                    <div class="editor"></div>
               </div>`,
    providers: [FileRegistry]
})
export class CodeEditorComponent implements OnInit {
    editor: CodeEditor;
    file: File;

    constructor(private elem: ElementRef, private fileRegistry: FileRegistry) {
    }

    ngOnInit(): any {
        let editorInstance = ace.edit(this.elem.nativeElement.getElementsByClassName('editor')[0]);
        this.editor        = new CodeEditor(editorInstance);

        // this check shouldn't be necessary
        if (this.file) {
            this.editor.setMode(this.file.type);
            this.file.content = this.fileRegistry
                .fetchFileContent(this.file);
            
            this.file.content.subscribe(text => {
               if (text !== null) {
                  this.editor.setText(text);
               } 
            });
        }
    }

    ngOnDestroy(): any {
        this.editor.dispose();
    }

    public setState(state) {
        // @todo figure out why this is undefined on startup
        if (state.fileInfo) {
            this.file = new File(state.fileInfo);
        }
    }
}
