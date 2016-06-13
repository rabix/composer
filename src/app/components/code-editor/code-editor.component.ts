import {Component, OnInit, ElementRef} from "@angular/core";
import {CodeEditor} from "./code-editor.service";
import {FileRegistry} from "../../services/file-registry.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import Editor = AceAjax.Editor;
import TextMode = AceAjax.TextMode;
import {FileModel} from "../../store/models/fs.models";

require('./code-editor.component.scss');

@Component({
    selector: 'code-editor',
    directives: [BlockLoaderComponent],
    template: `
                <div class="code-editor-container">
                     <block-loader *ngIf="editor.fileIsLoading"></block-loader>
                     <div class="editor" [hidden]="editor.fileIsLoading "></div>
                </div>`,
})
export class CodeEditorComponent implements OnInit {
    editor: CodeEditor;
    file: FileModel;

    constructor(private elem: ElementRef, private fileRegistry: FileRegistry) {}

    ngOnInit(): any {
        let editorInstance = ace.edit(this.elem.nativeElement.getElementsByClassName('editor')[0]);
        this.editor        = new CodeEditor(editorInstance);

        // this check shouldn't be necessary
        if (this.file) {
            this.editor.setMode(this.file.type || '.txt');
            this.editor.setTextStream(this.fileRegistry.loadFile(this.file.absolutePath));
        }
    }

    ngOnDestroy(): any {
        this.editor.dispose();
    }

    public setState(state) {
        // @todo figure out why this is undefined on startup
        if (state.fileInfo) {
            this.file = state.fileInfo;
        }
    }
}
