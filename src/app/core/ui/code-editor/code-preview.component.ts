import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Input,
    Output,
    Renderer,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Observable} from "rxjs";
import {ComponentBase} from "../../../components/common/component-base";
import {CodeEditorComponent} from "./code-editor.component";

@Component({
    encapsulation: ViewEncapsulation.None,

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
    content = "";

    @Input()
    language = "javascript";

    @Input()
    @HostBinding("style.width.px")
    width = 500;

    @Input()
    @HostBinding("style.height.px")
    height = 300;

    @Output()
    viewReady;

    @ViewChild("editor", {read: CodeEditorComponent})
    private editor: CodeEditorComponent;

    contentStream: Observable<string>;

    constructor(private renderer: Renderer, private elemRef: ElementRef) {
        super();
    }

    ngOnInit() {
        this.contentStream = Observable.of(this.content);
    }

    ngAfterViewInit() {

        const editor = this.editor.getEditorInstance();
        const lineNum = editor.getValue().trim().split(/\r\n|\r|\n/).length;
        const lineHeight = 16; // Sorry for hardcoding, low priority >:(!

        this.renderer.setElementStyle(this.elemRef.nativeElement, "height", Math.min(lineNum, 20) * lineHeight + "px");
        super.ngAfterViewInit();
    }
}
