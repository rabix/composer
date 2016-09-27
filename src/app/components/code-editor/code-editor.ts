import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {FileModel} from "../../store/models/fs.models";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";
import {AbstractCodeEditor} from "../abstract-code-editor/abstract-code-editor";

export class CodeEditor extends AbstractCodeEditor {

    private fileStream: Observable<FileModel>;

    private subs: Subscription[] = [];

    private webWorkerService: WebWorkerService;

    public contentChanges: Observable<FileModel>;

    public validationResult: Observable<ValidationResponse>;

    constructor(private editor: Editor,
                private fileStream: Observable<FileModel>,
                private webWorkerService: WebWorkerService) {

        super();
        this.editor = editor;

        // to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;

        this.session    = editor.getSession();
        this.document   = this.session.getDocument();
        this.fileStream = fileStream;

        this.setTheme('chrome');

        this.subs.push(
            this.fileStream.filter(file => file.content !== this.document.getValue())
                .subscribe(file => {
                    this.setMode(file.type || ".txt");
                    this.setText(file.content);
                    this.validateJsonSchema(file.content);
                })
        );

        this.contentChanges = Observable.fromEvent(this.editor as any, "change")
            .debounceTime(300)
            .map(_ => this.document.getValue())
            .distinctUntilChanged()
            .withLatestFrom(this.fileStream, (content, file) => {
                return Object.assign(file, {content});
            }).share();

        this.validationResult = this.webWorkerService.validationResultStream;
        this._attachJsonValidation();
    }

    private _attachJsonValidation(): void {
        this.subs.push(
            this.contentChanges
                .map(file => {
                    return file.content;
                })
                .subscribe((content: string) => {
                    this.validateJsonSchema(content);
                })
        );
    }

    private validateJsonSchema(content: string): void {
        this.webWorkerService.validateJsonSchema(content);
    }

    public dispose(): void {
        this.editor.destroy();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
