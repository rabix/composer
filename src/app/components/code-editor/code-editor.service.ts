import {Subject} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import Editor = AceAjax.Editor;
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {ACE_MODES_MAP} from "./code-editor-modes-map";
import {IFileChanges} from "../../services/file-registry.service";
import {WebWorkerService, ValidationResponse} from "../../services/webWorker/web-worker.service";

export class CodeEditor {
    editor: Editor;
    session: IEditSession;
    document: Document;

    fileIsLoading: boolean;

    private subscriptions: Subscription[] = [];

    text: string;
    textStream: BehaviorSubject<IFileChanges>;
    changeStream: Subject<any> = new Subject();

    webWorkerService: WebWorkerService;

    constructor(editor: Editor) {
        this.editor                 = editor;
        // to disable a warning message from ACE about a deprecated method
        this.editor.$blockScrolling = Infinity;
        this.session                = editor.getSession();
        this.document               = this.session.getDocument();
        this.webWorkerService       = new WebWorkerService();

        this.fileIsLoading = true;

        this.setTheme('twilight');
        this._attachEventStreams();
    }

    private _attachEventStreams() {

        //noinspection TypeScriptUnresolvedFunction
        let changeSubscription = Observable.fromEventPattern(
            (handler) => {
                this.document.on('change', e => {
                    handler(e);
                });
            }, () => {})
            .map(() => {
                return {
                    source: 'ACE_EDITOR',
                    content: this.document.getValue()
                };
            }).subscribe((event) => {
                this.textStream.next(event);
            });

        this.subscriptions.push(changeSubscription);
    }

    private _attachJsonValidation(): void {
        this.textStream
            .map((fileChanges: IFileChanges) => {
                return fileChanges.content;
            })
            .distinctUntilChanged()
            .debounceTime(500)
            .subscribe((jsonText: string) => {
                this.webWorkerService.validateJsonSchema(jsonText)
                    .subscribe((res: ValidationResponse) => {
                        console.dir(res);
                    }, err => {
                        console.log(err);
                    });
            });
    }

    public setTextStream(textStream: BehaviorSubject<IFileChanges>): void {
        this.textStream = textStream;

        this.textStream.filter((event) => {
            return event.content !== null && event.source !== "ACE_EDITOR";
        }).map((event) => {
            return event.content
        }).subscribe((content) => {
            this.setText(content);
            this.fileIsLoading = false;
        });

        this._attachJsonValidation();
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
        // detach listeners and subscriptions
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
    }
}
