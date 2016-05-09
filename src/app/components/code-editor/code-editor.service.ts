import {Subject} from 'rxjs';
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

export class CodeEditor {
    editor:Editor;
    session:IEditSession;
    document:Document;

    text:string;

    changeStream:Subject<any> = new BehaviorSubject<any>({});
    
    constructor(editor:Editor) {
        this.editor = editor;
        this.session = editor.getSession();
        this.document = this.session.getDocument();

        this.setTheme('twilight');
        this.setMode('javascript');
        this._attachEventStreams();
    }
    
    private _attachEventStreams() {

        Observable.fromEventPattern(
            (h) => {
                this.document.on('change', (e) => {
                    h(e);
                });
            }, (h) => {
            }
        ).subscribe(this.changeStream);
    }

    public setText(text:string):void {
        this.document.setValue(text);
    }

    public setTheme(theme:string):void {
        require('brace/theme/' + theme);
        this.editor.setTheme('ace/theme/' + theme);
    }

    public setMode(mode:string):void {
        require('brace/mode/' + mode);
        this.session.setMode('ace/mode/' + mode);
    }

    public dispose():void {
        // detach listeners and subscriptions
    }
}
