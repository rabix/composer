import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {ExpressionEditor} from "./expression-editor";
import {ExpressionEditorData} from "../../../models/expression-editor-data.model";
import {SandboxService, SandboxResponse} from "../../../services/sandbox/sandbox.service";
import {Subscription} from "rxjs/Subscription";
import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;
import {Observable} from "rxjs/Observable";

require ("./expression-editor.component.scss");

@Component({
    selector: "expression-editor",
    template: `
         <div class="expression-editor-component">
                <div class="expression-editor-header">
                
                    <span class="expression-head-text">
                        Argument value expression
                        <i class="fa fa-info-circle"></i>
                    </span>
                    
                    <span class="expression-buttons-container">
                        <button type="button"
                            class="btn btn-secondary expression-editor-btn"
                            (click)="cancel()">Cancel</button>
                        
                        <button type="button" 
                            class="btn btn-success expression-editor-btn"
                            (click)="save()">Save</button>
                    </span>
                </div>
                
                <div #ace class="ace-editor"></div>
                
                <div class="expression-result-container">
                    <div class="code-preview">
                         Code preview:
                        <div>
                            {{evaluatedExpression}}
                        </div>
                    </div>
                    
                    <button type="button" 
                            class="btn btn-primary expression-editor-btn execute-btn"
                            (click)="evaluateExpression()">Execute</button>
                </div>
         </div>
 `
})
export class ExpressionEditorComponent implements OnInit, OnDestroy {

    /** Expression coming form the tool */
    private initialExpressionScript: string;

    /** Evaluated expressions */
    private newValueStream: Subject<string | ExpressionModel>;

    /** Reference to the element in which we want to instantiate the Ace editor */
    @ViewChild("ace")
    private aceContainer: ElementRef;

    private editor: ExpressionEditor;

    /** Code String that we send to the sandbox */
    private codeToEvaluate: string;

    /** String we display as the result */
    private evaluatedExpression: string;

    private sandboxService: SandboxService;

    private subs: Subscription[];

    private sandBoxSub: Subscription;

    constructor(private expressionSidebarService: ExpressionSidebarService) {
        this.subs = [];
    }

    ngOnInit(): any {
        this.subs.push(
            this.expressionSidebarService.expressionDataStream.subscribe((data:ExpressionEditorData) => {
                this.initSandbox();

                this.initialExpressionScript = data.expression;
                this.newValueStream = data.newExpressionChange;

                this.editor = new ExpressionEditor(ace.edit(this.aceContainer.nativeElement), this.initialExpressionScript);
                this.codeToEvaluate = this.initialExpressionScript;

                this.listenToExpressionChanges();
            })
        );
    }

    private listenToExpressionChanges(): void {
        let expressionChanges = this.editor.expressionChanges.subscribe(expression => {
            this.codeToEvaluate = expression;
        });

        this.subs.push(expressionChanges);
    }

    private initSandbox(): void {
        this.sandboxService = new SandboxService();
        this.codeToEvaluate = "";
        this.evaluatedExpression = "";
    }

    private evaluateExpression(): Observable<SandboxResponse> {
        this.removeSandboxSub();
        let responseResult: Subject<SandboxResponse> = new Subject<SandboxResponse>();

        this.sandBoxSub = this.sandboxService.submit(this.codeToEvaluate)
            .subscribe((result: SandboxResponse) => {
                if (result.error) {
                    //TODO: make error message nicer on the UI
                    this.evaluatedExpression = result.error;
                } else {
                    this.evaluatedExpression = result.output;
                }

                responseResult.next(result);
            });

        return responseResult;
    }

    private cancel(): void {
        this.editor.setText(this.initialExpressionScript);
        this.codeToEvaluate = this.initialExpressionScript;
        this.expressionSidebarService.closeExpressionEditor();
    }

    private save(): void {
        this.evaluateExpression()
            .subscribe((result: SandboxResponse) => {
            if (result.error || result.output === "undefined" || result.output === "null") {
                this.newValueStream.next(this.initialExpressionScript);

            } else {
                this.newValueStream.next(new ExpressionModel({
                    script: this.codeToEvaluate,
                    expressionValue: result.output
                }));
            }
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
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
