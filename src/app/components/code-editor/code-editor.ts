import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {FileModel} from "../../store/models/fs.models";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";
import {AbstractCodeEditorService} from "../../services/abstract-code-editor/abstract-code-editor.service";

export class CodeEditor extends AbstractCodeEditorService {

    private fileStream: Observable<FileModel>;

    private subs: Subscription[] = [];

    private webWorkerService: WebWorkerService;

    public contentChanges: Observable<FileModel>;

    public validationResult: Observable<ValidationResponse>;

    constructor(editor: Editor, fileStream: Observable<FileModel>) {
        super();
        this.editor = editor;

        // to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;

        this.session    = editor.getSession();
        this.document   = this.session.getDocument();
        this.fileStream = fileStream;
        this.webWorkerService = new WebWorkerService();

        this.setTheme('twilight');

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
        this.contentChanges
            .map(file => {
                return file.content;
            })
            .subscribe((content: string) => {
                this.validateJsonSchema(content);
            });
    }

    private validateJsonSchema(content: string) {
        this.webWorkerService.validateJsonSchema(content);
    }

    public dispose(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
