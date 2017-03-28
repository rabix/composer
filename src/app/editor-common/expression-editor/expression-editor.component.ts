import {AfterViewInit, Component, HostBinding, Input, OnInit, Output, ViewChild} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Subject} from "rxjs/Subject";
import {CodeEditorComponent} from "../../ui/code-editor-new/code-editor.component";
import {AceEditorOptions} from "../../ui/code-editor/code-editor.component";
import {TreeNode} from "../../ui/tree-view/tree-node";
import {TreeViewService} from "../../ui/tree-view/tree-view.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TreeViewComponent} from "../../ui/tree-view/tree-view.component";

@Component({
    selector: "ct-expression-editor",
    styleUrls: ["./expression-editor.component.scss"],
    providers: [TreeViewService],
    template: `
        <div class="main-content">
            <div class="code">

                <div class="editor">
                    <ct-code-editor #editor [formControl]="editorControl" [options]="editorOptions"></ct-code-editor>
                </div>

                <div class="preview">
                    <ct-code-editor [formControl]="previewControl" [options]="previewOptions"></ct-code-editor>
                </div>
            </div>
            <div class="tree">
                <ct-tree-view [nodes]="contextNodes"></ct-tree-view>
            </div>
        </div>
        <div class="modal-footer pb-1 pt-1 pr-1">
            <button *ngIf="!readonly" (click)="action.next('save')" class="btn btn-primary ml-1" type="button">Save</button>
            <button (click)="action.next('close')" class="btn btn-secondary " type="button mr-1">Cancel</button>
        </div>
    `
})
export class ExpressionEditorComponent extends DirectiveBase implements OnInit, AfterViewInit {

    @Input()
    @HostBinding("style.height.px")
    height = 600;

    @Input()
    @HostBinding("style.width.px")
    width = 800;

    @Input()
    context: { $job?: Object, $self?: Object };

    @Input()
    code: string;

    @Input()
    evaluator: (code: string) => Promise<string>;

    @Input()
    readonly = false;

    @Output()
    action = new Subject<"close" | "save">();

    @ViewChild(TreeViewComponent)
    treeView: TreeViewComponent;

    tree: TreeViewService;

    editorOptions: Partial<AceEditorOptions>;
    previewOptions: Partial<AceEditorOptions> = {
        wrap: true,
        readOnly: true,
        showLineNumbers: false,
        useWorker: false,
    };

    editorControl  = new FormControl(undefined);
    previewControl = new FormControl(undefined);

    contextNodes: TreeNode<any>[];

    @ViewChild("editor", {read: CodeEditorComponent})
    private editor: CodeEditorComponent;


    ngOnInit() {

        this.editorOptions = {
            wrap: true,
            useWorker: false,
            showLineNumbers: false,
            readOnly: this.readonly,
            mode: "ace/mode/javascript",
            enableBasicAutocompletion: true,
        };

        this.tracked = this.editorControl.valueChanges.debounceTime(300)
            .filter(e => typeof e === "string")
            .distinctUntilChanged()
            .subscribe(content => {
                this.evaluator(content).then(res => {
                    this.previewControl.setValue(res);
                });
            });

        this.editorControl.setValue(this.code);
        this.contextNodes = this.transformContext(this.context);
    }

    ngAfterViewInit() {
        this.tree = this.treeView.getService();

        this.tracked = this.tree.open.subscribe(node => {
            this.editor.editor.session.insert(this.editor.getEditorInstance().getCursorPosition(), String(node.id));
        });
    }


    private transformContext(context: { $job?: Object, $self?: Object } = {}): TreeNode<any>[] {

        const wrap = (nodes, path = ""): TreeNode<any>[] => Object.keys(nodes).map(key => {
            const contextItem = nodes[key];

            const node: TreeNode<any> = {
                icon: ""
            };

            let type: string = typeof contextItem;
            if (Array.isArray(contextItem)) {
                type = "array";
            } else if (contextItem === null) {
                type = "null";
            }

            const isIterable = type === "array" || type === "object";
            const isNothing  = contextItem === undefined || contextItem === null;

            let typeDisplay = isIterable ? type : `"${contextItem}"`;
            if (isNothing) {
                typeDisplay = String(contextItem);
            } else if (type === "array") {
                typeDisplay = type + "[" + contextItem.length + "]";
            }


            if (isIterable) {
                node.icon         = "fa-angle-right";
                node.iconExpanded = "fa-angle-down";
            }

            node.label = `<span class="varname">${key}: <span class="vartype">${typeDisplay}</span></span>`;

            const trace = [path, key].filter(e => e).join(".");

            if (type === "object") {
                node.isExpandable = true;
                node.children     = wrap(contextItem, trace);

            } else if (type === "array") {
                node.isExpandable = true;
                node.children     = wrap(contextItem.reduce((acc, item, index) => ({acc, [index]: item}), {}), trace);
            } else {
                node.id = trace.split(".").map(p => (parseInt(p, 10).toString() == p) ? `[${p}]` : p).join(".")
                    .replace(/\]\.\[/g, "][")
                    .replace(/\.\[/g, "[");
            }

            return node;
        });

        return wrap(context) as TreeNode<any>[];

    }
}
