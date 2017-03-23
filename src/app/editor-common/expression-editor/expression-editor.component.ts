import {Component, HostBinding, Input, OnInit, Output, ViewChild} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {TreeNode} from "../../ui/tree-view-old/types";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {CodeEditorComponent} from "../../ui/code-editor-new/code-editor.component";

@Component({
    selector: "ct-expression-editor",
    styleUrls: ["./expression-editor.component.scss"],
    template: `
        <div class="p-0 flex-row-container modal-large">

            <div class="main-row">
                <div class="flex-col code-col">
                    <div class="title">Expression:</div>
                    <div class="code-main">
                        <ct-code-editor #editor [formControl]="expressionControl" [options]="{
                        'theme': 'ace/theme/monokai',
                        'mode': 'ace/mode/javascript',
                        'showGutter': false,
                        'wrap': true
                        }"></ct-code-editor>
                    </div>

                    <div class="title">Output:</div>
                    <div class="code-preview">

                        <ct-code-editor [formControl]="resultControl" [options]="{
                            'theme': 'ace/theme/monokai',
                            'showGutter': false,
                            'wrap': true,
                            'readOnly': true,
                            'useWorker': false
                        }"></ct-code-editor>
                    </div>
                </div>

                <div class="context-col">
                    <ct-tree-view [nodes]="contextNodes"></ct-tree-view>
                </div>
            </div>

            <div class="modal-footer">
                <button (click)="action.next('close')" class="btn btn-secondary btn-sm" type="button">Cancel</button>
                <button *ngIf="!readonly" (click)="action.next('save')" class="btn btn-primary btn-sm" type="button">Save</button>
            </div>
        </div>

    `
})
export class ExpressionEditorComponent extends DirectiveBase implements OnInit {

    @Input()
    @HostBinding("style.height.px")
    public height;

    @Input()
    @HostBinding("style.width.px")
    public width;

    @Input()
    public context: { $job?: Object, $self?: Object };

    @Input()
    public editorContent: Observable<string>;

    @Input()
    public evaluator: (code: string) => Promise<string>;

    @Input()
    public readonly = false;

    @Output()
    public action = new Subject<"close" | "save">();

    expressionControl = new FormControl(undefined);
    resultControl = new FormControl(undefined);

    public contextNodes: TreeNode[];

    @ViewChild("editor", {read: CodeEditorComponent})
    private editor: CodeEditorComponent;


    ngOnInit() {
        this.tracked = this.editorContent.subscribe(content => {
            this.expressionControl.setValue(content);
        });

        this.tracked = this.expressionControl.valueChanges.debounceTime(50)
            .filter(e => typeof e === "string")
            .distinctUntilChanged()
            .subscribe(content => {
                this.evaluator(content).then(res => {
                    this.resultControl.setValue(res);
                });
            });

        this.contextNodes = this.transformContext(this.context);
    }


    private transformContext(context: { $job?: Object, $self?: Object } = {}): TreeNode[] {

        const wrap = (nodes, path = ""): TreeNode[] => Object.keys(nodes).map(key => {
            const node = nodes[key];

            let type = typeof node;
            if (Array.isArray(node)) {
                type = "array";
            } else if (node === null) {
                type = "null";
            }

            const isIterable = type === "array" || type === "object";
            const isNothing = node === undefined || node === null;

            let typeDisplay = isIterable ? type : `"${node}"`;
            if (isNothing) {
                typeDisplay = String(node);
            } else if (type === "array") {
                typeDisplay = type + "[" + node.length + "]";
            }

            const icon = isIterable ? "angle" : "";
            const name = `<pre>${key}: <i>${typeDisplay}</i></pre>`;

            let childrenProvider = undefined;
            let openHandler = undefined;

            let trace = [path, key].filter(e => e).join(".");
            if (type === "object") {
                childrenProvider = () => Observable.of(wrap(node, trace));
            } else if (type === "array") {
                childrenProvider = () => Observable.of(wrap(node.reduce((acc, item, index) => {
                    return Object.assign(acc, {[index]: item});
                }, {}), trace));
            } else {
                openHandler = () => {


                    trace = trace.split(".").map(p => (parseInt(p, 10).toString() == p) ? `[${p}]` : p).join(".")
                        .replace(/\]\.\[/g, "][")
                        .replace(/\.\[/g, "[");
                    this.editor.editor.session.insert(this.editor.editor.getCursorPosition(), String(trace));
                };
            }

            return {name, childrenProvider, icon, openHandler} as TreeNode;
        });

        return wrap(context) as TreeNode[];

    }
}
