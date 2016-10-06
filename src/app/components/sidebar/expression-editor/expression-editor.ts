import {Observable} from "rxjs/Observable";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;
import {AbstractCodeEditor} from "../../abstract-code-editor/abstract-code-editor";
import {Subscription} from "rxjs/Subscription";

require ("./expression-editor.component.scss");

export class ExpressionEditor extends AbstractCodeEditor {

    private subs: Subscription[] = [];

    public expressionChanges: Observable<string>;

    constructor(protected editor: Editor,
                private expressionStream: Observable<string>) {

        super();
        this.editor = editor;

        // to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;

        this.session = this.editor.getSession();
        this.document = this.session.getDocument();

        this.setTheme('twilight');
        this.setMode("javascript");

        this.subs.push(
            this.expressionStream
                .filter(expression => expression.length > 0)
                .subscribe((expression: string) => {
                    this.setText(expression);
                })
        );

        this.expressionChanges = Observable.fromEvent(this.editor as any, "change")
            .debounceTime(300)
            .map(_ => this.document.getValue())
            .distinctUntilChanged()
            .withLatestFrom(this.expressionStream, (expression) => expression)
            .share();
    }

    public dispose(): void {
        this.editor.destroy();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
