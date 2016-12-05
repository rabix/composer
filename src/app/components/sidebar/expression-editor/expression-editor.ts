import {Observable} from "rxjs/Observable";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;
import {AbstractCodeEditor} from "../../abstract-code-editor/abstract-code-editor";
import {Subscription} from "rxjs/Subscription";

require ("./expression-editor.component.scss");

/**
 * @deprecated
 */
export class ExpressionEditor extends AbstractCodeEditor {

    private subs: Subscription[] = [];

    public expressionChanges: Observable<string>;

    constructor(protected editor: Editor,
                private expression: string) {

        super();
        this.editor = editor;

        //to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;

        this.session = this.editor.getSession();
        this.document = this.session.getDocument();

        this.setTheme("monokai");
        this.setMode("javascript");

        this.setText(this.expression);

        this.expressionChanges = Observable.fromEvent(this.editor as any, "change")
            .debounceTime(300)
            .map(_ => this.document.getValue())
            .distinctUntilChanged()
            .share();
    }

    public dispose(): void {
        this.editor.destroy();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
