import {Subject} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {ACE_MODES_MAP} from "./code-editor-modes-map";

export class CodeEditor {
    editor: Editor;
    session: IEditSession;
    document: Document;

    private subscriptions: Subscription[] = [];

    text: string;

    textStream: Observable<string> = new BehaviorSubject(null);
    changeStream: Observable<any>  = new Subject();

    constructor(editor: Editor) {
        this.editor   = editor;
        this.session  = editor.getSession();
        this.document = this.session.getDocument();

        this.setTheme('twilight');
        this._attachEventStreams();
    }

    private _attachEventStreams() {

        let changeSubscription = Observable.fromEventPattern(
            (h) => {
                this.document.on('change', (e) => {
                    h(e);
                });
            }, (h) => {
            }
        ).subscribe(this.changeStream);

        this.subscriptions.push(changeSubscription);
    }

    public setText(text: string): void {
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
        // detach listeners and subscriptions
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
    }
}
