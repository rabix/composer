import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditor} from "./code-editor";
import {Component, OnInit, ElementRef, ViewChild, Input, OnDestroy} from "@angular/core";
import {Subscription, Observable} from "rxjs/Rx";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
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

    @Input()
    public content: Observable<string>;

    @Input()
    public language: Observable<string>;

    /** Holds the reference to the CodeEditor service/component */
    private editor: CodeEditor;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[] = [];

    private webWorkerService: WebWorkerService;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    constructor(private webWorkerService: WebWorkerService) {
    }

    ngOnInit(): any {

        // Instantiate the editor and give it the stream through which the file will come through
        this.editor = new CodeEditor(
            ace.edit(this.aceContainer.nativeElement),
            this.content,
            this.language,
            this.webWorkerService
        );

        // this.subs.push(
        //     this.editor.contentChanges.skip(1).subscribe((file) => {
        //         this.eventHub.publish(new UpdateFileAction(file));
        //     })
        // );
        //
        // this.subs.push(
        //     this.editor.validationResult
        //         .subscribe((result: ValidationResponse) => {
        //             this.eventHub.publish(new CwlValidationResult(result));
        //         })
        // );
    }

    ngOnDestroy(): void {
        this.editor.dispose();
        this.subs.forEach(sub => sub.unsubscribe());
    }

}
