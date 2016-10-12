import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";
import {FileModel} from "../../store/models/fs.models";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {AbstractCodeEditor} from "../abstract-code-editor/abstract-code-editor";
import {Subject} from "rxjs";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;

export class CodeEditor extends AbstractCodeEditor {

    private webWorkerService: WebWorkerService;

    public validationResult: Observable<ValidationResponse>;

    public contentChange = new Subject<string>();

    private subs: Subscription[] = [];

    constructor(private editor: Editor,
                private content: Subject<string>,
                private contentType: Observable<string>,
                private webWorkerService: WebWorkerService) {

        super();
        this.editor = editor;

        // to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;

        this.session  = editor.getSession();
        this.document = this.session.getDocument();

        this.setTheme("chrome");

        this.contentType.subscribe(type => {
            this.setMode("json");
        });

        this.content.subscribe(rawText => {
            this.document.setValue(rawText);
            // this.validateJsonSchema(rawText);
        });

        Observable.fromEvent(this.editor, "change")
            .debounceTime(500)
            .map(_ => this.document.getValue())
            .subscribe(this.contentChange);

        // this.contentChanges = Observable.fromEvent(this.editor as any, "change")
        //     .debounceTime(300)
        //     .map(_ => this.document.getValue())
        //     .distinctUntilChanged()
        //     .withLatestFrom(this.content, (content, file) => {
        //         return Object.assign(file, {content});
        //     }).share();

        // this.validationResult = this.webWorkerService.validationResultStream;
        // this._attachJsonValidation();
    }

    // private _attachJsonValidation(): void {
    //     this.subs.push(
    //         this.contentChanges
    //             .map(file => {
    //                 return file.content;
    //             })
    //             .subscribe((content: string) => {
    //                 this.validateJsonSchema(content);
    //             })
    //     );
    // }
    //
    // private validateJsonSchema(content: string): void {
    //     this.webWorkerService.validateJsonSchema(content);
    // }
    //
    public dispose(): void {
        this.editor.destroy();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
