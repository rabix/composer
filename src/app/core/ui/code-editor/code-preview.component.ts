import {Component, Input, ChangeDetectionStrategy, HostBinding, Output, ViewChild} from "@angular/core";
import {Observable} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {CodeEditorComponent} from "./code-editor.component";

@Component({
    selector: "ct-code-preview",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-code-editor-x #editor
          [(content)]="contentStream"
          [language]="language"
          [options]="{
            readOnly: true,
            theme: 'ace/theme/monokai',
            showGutter: false,
            behavioursEnabled:false,
            firstLineNumber: false,
            foldStyle: false,
            useWorker: false
        }"></ct-code-editor-x>
    `
})
export class CodePreviewComponent extends ComponentBase {

    @Input()
    public content = "";

    @Input()
    public language = "javascript";

    @Input()
    @HostBinding("style.width.px")
    public width = 500;

    @Input()
    @HostBinding("style.height.px")
    public height = 300;

    @Output()
    public viewReady;

    @ViewChild("editor", {read: CodeEditorComponent})
    private editor: CodeEditorComponent;

    private contentStream: Observable<string>;

    constructor() {
        super();
    }

    ngOnInit() {
        this.contentStream = Observable.of(this.content);
    }

    ngAfterViewInit() {
        const editor     = this.editor.getEditorInstance();
        const lineNum    = editor.getValue().trim().split(/\r\n|\r|\n/).length;
        const lineHeight = 16; // Sorry for hardcoding, low priority

        this.height = Math.min(lineNum, 20) * lineHeight;
        super.ngAfterViewInit();
    }
}