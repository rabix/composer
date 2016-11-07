import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {ExpressionEditor} from "./expression-editor";
import {ExpressionEditorData} from "../../../models/expression-editor-data.model";
import {SandboxService, SandboxResponse} from "../../../services/sandbox/sandbox.service";
import {Subscription} from "rxjs/Subscription";
import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {Subject, Observable, ReplaySubject} from "rxjs";
import {ComponentBase} from "../../common/component-base";
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {Validation} from "cwlts/models/interfaces";

require("./expression-editor.component.scss");

@Component({
    selector: "expression-editor",
    host: {
        "class": "block"
    },
    template: `
        <div class="expression-editor-component">
            <div class="expression-editor-header">
                        
                <span class="expression-head-text">
                    Expression
                    <!--@todo(maya) path to object where expression lives-->
                    <i class="fa fa-info-circle help-icon"></i>
                </span>
        
                <span class="expression-buttons-container">
                    <button type="button"
                            class="btn btn-sm btn-outline-secondary"
                            (click)="cancel()">Cancel</button>
                    
                    <button type="button"
                            class="btn btn-sm btn-success"
                            (click)="save()">Save</button>
                </span>
            </div>
        
            <div #ace class="ace-editor"></div>
        
            <div class="expression-result-container">
                <div class="code-preview">
                    Result
                </div>
        
                <pre class="expression-result-value" *ngIf="result.output">{{ result.output | json }}</pre>
                <pre class="expression-result-value has-error" *ngIf="result.error">{{ result.error }}</pre>
                <pre class="expression-result-value has-warning" *ngIf="result.warning">{{ result.warning }}</pre>
                 
            </div>
        </div>
 `
})
export class ExpressionEditorComponent extends ComponentBase implements OnInit, OnDestroy {

    /** Evaluated expressions */
    private newValueStream: Subject<ExpressionModel>;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    private editor: ExpressionEditor;

    /** Global context in which expression should be evaluated */
    private context: any;

    /** String we display as the result */
    private evaluatedExpression: string;

    private result: SandboxResponse = {};

    private sandboxService: SandboxService;

    private sandBoxSub: Subscription;

    private expression: ExpressionModel;

    private originalVal: ExpressionModel;
    private content: string;

    constructor(private expressionSidebarService: ExpressionSidebarService) {
        super();
    }

    ngOnInit(): void {
        this.sandboxService = new SandboxService();

        this.tracked = this.expressionSidebarService.expressionDataStream
            .mergeMap((data: ExpressionEditorData) => {
                this.originalVal = data.value;
                const serialized = data.value.serialize();
                this.content = (serialized as Expression).script || "";

                this.expression = new ExpressionModel(data.value.serialize());
                this.context = data.context;

                this.newValueStream = data.newExpressionChange;
                this.editor         = new ExpressionEditor(ace.edit(this.aceContainer.nativeElement), this.content);

                // initially execute app
                this.evaluateExpression(this.expression.getScriptForExec());

                return this.editor.expressionChanges;
            })
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(expression => {
                this.content = expression;
                this.expression.setValue(this.content, "expression");

                this.evaluateExpression(this.expression.getScriptForExec());
            });
    }

    private evaluateExpression(expression: string): Observable<SandboxResponse> {
        this.removeSandboxSub();
        const responseResult = new ReplaySubject<SandboxResponse>();

        this.sandBoxSub      = this.sandboxService.submit(expression, this.context)
            .subscribe((result: SandboxResponse) => {
                this.evaluatedExpression = result.error ? result.error : result.output;
                this.result = result;
                responseResult.next(result);
            });

        return (responseResult as Observable<SandboxResponse>);
    }

    private cancel(): void {
        this.newValueStream.next(this.originalVal);
        this.expressionSidebarService.closeExpressionEditor();
    }

    private save(): void {
        const expr = new ExpressionModel();
        expr.setValue(this.content, "expression");

        this.tracked = this.evaluateExpression(expr.getScriptForExec())
            .subscribe((result: SandboxResponse) => {
                this.expression.setValue(this.content, "expression");
                // @todo(maya) move execution to model
                const err = result.error ? [result.error] : [];
                const warn = result.warning ? [result.warning] : [];
                this.expression.validation = <Validation>{error: err, warning: warn};
                this.expression.result = result.output;
                this.newValueStream.next(this.expression);
            });
    }

    private removeSandboxSub(): void {
        if (this.sandBoxSub) {
            this.sandBoxSub.unsubscribe();
            this.sandBoxSub = undefined;
        }
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.dispose();
        }

        this.removeSandboxSub();
        super.ngOnDestroy();
    }
}