import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {ACE_MODES_MAP} from "./code-editor-modes-map";
import {FileModel} from "../../store/models/fs.models";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {ValidationResponse, WebWorkerService} from "../../services/webWorker/web-worker.service";
import {EventEmitter} from "events";

export class CodeEditor {
    /** Holds an instance of the AceEditor */
    private editor: Editor;

    /** Holds the AceEditor session object */
    private session: IEditSession;

    private document: Document;

    private fileStream: Observable<FileModel>;

    private subs: Subscription[] = [];

    private webWorkerService: WebWorkerService;

    public contentChanges: Observable<FileModel>;


    constructor(editor: Editor, fileStream: Observable<FileModel>) {
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
                })
        );

        this.contentChanges = Observable.fromEvent(this.editor as any, "change")
            .debounceTime(300)
            .map(_ => this.document.getValue())
            .distinctUntilChanged()
            .withLatestFrom(this.fileStream, (content, file) => {
                return Object.assign(file, {content});
            }).share();

        this._attachJsonValidation();
    }

    private _attachJsonValidation(): void {
        this.contentChanges
            .map(file => {
                return file.content;
            })
            .distinctUntilChanged()
            .debounceTime(500)
            .subscribe((content: string) => {
                this.webWorkerService.validateJsonSchema(content)
                    .subscribe((res: ValidationResponse) => {
                        console.dir(res);
                    }, err => {
                        console.log(err);
                    });
            });
    }

    private setText(text: string): void {
        this.document.setValue(text);
    }

    public setTheme(theme: string): void {
        require('brace/theme/' + theme);
        this.editor.setTheme('ace/theme/' + theme);
    }

    public setMode(mode: string): void {
        if (mode.charAt(0) === '.') {
            mode = ACE_MODES_MAP[mode] ? ACE_MODES_MAP[mode] : 'text';
        }

        require('brace/mode/' + mode);
        this.session.setMode('ace/mode/' + mode);
    }

    public dispose(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
