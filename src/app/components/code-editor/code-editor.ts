import {AbstractCodeEditor} from "../abstract-code-editor/abstract-code-editor";
import {Subject, Observable, Subscription} from "rxjs";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {FileModel} from "../../store/models/fs.models";
import {AbstractCodeEditor} from "../abstract-code-editor/abstract-code-editor";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;

export class CodeEditor extends AbstractCodeEditor {

    private subs: Subscription[] = [];

    constructor(private editor: Editor,
                private content: Subject<string>,
                private contentType: Observable<string>,
                options = {}) {

        super();
        this.editor = editor;
        this.editor.setOptions(options);

        // to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;

        this.session  = editor.getSession();
        this.document = this.session.getDocument();

        this.setTheme("chrome");

        this.contentType.subscribe(type => {
            this.setMode(type || "json");
        });

        this.content
            .filter(external => external !== this.document.getValue())
            .subscribe(rawText => {
                this.document.setValue(rawText);
            });

        Observable.fromEvent(this.editor as EventTarget, "change")
            .debounceTime(150)
            .map(_ => this.document.getValue())
            .subscribe(this.content);

    }

    public dispose(): void {
        this.editor.destroy();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
