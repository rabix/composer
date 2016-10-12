import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {FileModel} from "../../store/models/fs.models";
import {AbstractCodeEditor} from "../abstract-code-editor/abstract-code-editor";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;

export class CodeEditor extends AbstractCodeEditor {

    private fileStream: Observable<FileModel>;

    private subs: Subscription[] = [];

    public contentChanges: Observable<FileModel>;

    constructor(private editor: Editor,
                private fileStream: Observable<FileModel>) {

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
                })
        );

        this.contentChanges = Observable.fromEvent(this.editor as any, "change")
            .debounceTime(300)
            .map(_ => this.document.getValue())
            .distinctUntilChanged()
            .withLatestFrom(this.fileStream, (content, file) => {
                return Object.assign(file, {content});
            }).share();
    }

    public dispose(): void {
        this.editor.destroy();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
