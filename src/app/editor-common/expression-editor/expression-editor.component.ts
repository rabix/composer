import {Component, Input, HostBinding, Output, ViewChild} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {TreeNode} from "../../core/ui/tree-view/types";
import {ComponentBase} from "../../components/common/component-base";
import {CodeEditorComponent} from "../../core/ui/code-editor/code-editor.component";

require("./expression-editor.component.scss");

@Component({
    selector: "ct-expression-editor",
    template: `
        <div class="p-0 flex-row-container modal-large">
            
            <div class="main-row">
                <div class="flex-col code-col">
                    <div class="title" >Expression:</div>
                    <div class="code-main">
                        <ct-code-editor-x #editor [content]="editorContent" [language]="'javascript'" [options]="{
                        'theme': 'ace/theme/monokai',
                        'showGutter': false,
                        'wrap': true
                        }"></ct-code-editor-x>
                    </div>
                    
                    <div class="title">Output:</div>
                    <div class="code-preview">
                        
                        <ct-code-editor-x  [content]="previewContent" [language]="'json'" [options]="{
                            'theme': 'ace/theme/monokai',
                            'showGutter': false,
                            'wrap': true,
                            'readOnly': true,
                            'useWorker': false
                        }"></ct-code-editor-x>
                    </div>
                </div>
                
                <div class="context-col">
                    <ct-tree-view [nodes]="contextNodes"></ct-tree-view>
                </div>
            </div>
            
            <div class="modal-footer">
                <button (click)="action.next('close')" class="btn btn-secondary btn-sm" type="button">Cancel</button>
                <button (click)="action.next('save')" class="btn btn-primary btn-sm" type="button">Save</button>
            </div>
        </div>
        
    `
})
export class ExpressionEditorComponent extends ComponentBase {

    @Input()
    @HostBinding("style.height.px")
    public height;

    @Input()
    @HostBinding("style.width.px")
    public width;

    @Input()
    public context: {$job?: Object, $self?: Object};

    @Input()
    public editorContent: Observable<string>;

    @Input()
    public evaluator: (code: string) => Promise<string>;

    @Output()
    public action = new Subject<"close"|"save">();

    private previewContent = new BehaviorSubject("");

    private contextNodes: TreeNode[];

    @ViewChild("editor", {read: CodeEditorComponent})
    private editor: CodeEditorComponent;


    ngOnInit() {
        this.tracked = this.editorContent.debounceTime(250)
            .filter(e => typeof e === "string")
            .distinctUntilChanged()
            .subscribe(content => {
                this.evaluator(content).then(res => {
                    this.previewContent.next(res);
                });
            });

        this.contextNodes = this.transformContext(this.context);
    }


    private transformContext(context: {$job?: Object, $self?: Object} = {}): TreeNode[] {

        const wrap = (nodes, path = "") => Object.keys(nodes).map(key => {
            const node = nodes[key];

            let type = typeof node;
            if (Array.isArray(node)) {
                type = "array";
            } else if (node === null) {
                type = "null"
            }

            const isIterable = type === "array" || type === "object";
            const isNothing  = node === undefined || node === null;

            let typeDisplay = isIterable ? type : `"${node}"`;
            if (isNothing) {
                typeDisplay = String(node);
            } else if (type === "array") {
                typeDisplay = type + "[" + node.length + "]";
            }

            const icon = isIterable ? "angle" : "";
            const name = `<pre>${key}: <i>${typeDisplay}</i></pre>`;

            let childrenProvider = undefined;
            let openHandler      = undefined;

            let trace = [path, key].filter(e => e).join(".");
            if (type === "object") {
                childrenProvider = () => Observable.of(wrap(node, trace));
            } else if (type === "array") {
                childrenProvider = () => Observable.of(wrap(node.reduce((acc, item, index) => {
                    return Object.assign(acc, {[index]: item});
                }, {}), trace));
            } else {
                openHandler = () => {


                    trace = trace.split(".").map(p => (parseInt(p) == p) ? `[${p}]` : p).join(".")
                        .replace(/\]\.\[/g, "][")
                        .replace(/\.\[/g, "[");
                    this.editor.editor.session.insert(this.editor.editor.getCursorPosition(), String(trace));
                };
            }

            return {name, childrenProvider, icon, openHandler};
        });

        return wrap(context);

    }
}
