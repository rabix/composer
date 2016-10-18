import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from "@angular/core";
import {ExpressionEditor} from "./expression-editor";
import {ExpressionEditorData} from "../../../models/expression-editor-data.model";
import {SandboxService, SandboxResponse} from "../../../services/sandbox/sandbox.service";
import {Subscription} from "rxjs/Subscription";
import {Subject} from "rxjs/Subject";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {ExpressionModel} from "cwlts/models/d2sb";
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import TextMode = AceAjax.TextMode;
import {Observable, Subject} from "rxjs";

require("./expression-editor.component.scss");

@Component({
    selector: "expression-editor",
    host: {
        class: "block"
    },
    template: `
         <div class="expression-editor-component">
                <div class="expression-editor-header">
                
                    <span class="expression-head-text">
                        Argument value expression
                        <i class="fa fa-info-circle help-icon"></i>
                    </span>
                    
                    <span class="expression-buttons-container">
                        <button type="button"
                            class="btn btn-sm btn-outline-secondary"
                            (click)="cancel()">Cancel</button>
                        
                        <button type="button" 
                            class="btn btn-sm btn-success"
                            (click)="save()">Add</button>
                    </span>
                </div>
                
                <div #ace class="ace-editor"></div>
                
                <div class="expression-result-container">
                    <div class="code-preview">
                         Code preview
                    </div>
                    
                    <div class="expression-result-value">
                           {{evaluatedExpression}}
                    </div>
                   
                    <div class="expression-result-overlay">
                        <div class="execute-button-container">
                            <button type="button" 
                                    class="btn btn-sm btn-outline-secondary execute-button"
                                    (click)="execute()"><i class="fa fa-refresh"></i> Update</button>
                        </div>
                    </div>
                   
                   
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

    /** Result we get back from the sandbox */
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
                this.newValueStream          = data.newExpressionChange;

                this.editor         = new ExpressionEditor(ace.edit(this.aceContainer.nativeElement), this.initialExpressionScript);
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
        this.codeToEvaluate = '';
        this.evaluatedExpression = '';
    }

    private execute(): void {
        this.removeSandboxSub();
        this.sandBoxSub = this.sandboxService.submit(this.codeToEvaluate)
            .subscribe((result: SandboxResponse) => {
                if (result.error) {
                    //TODO: make error message nicer on the UI
                    this.evaluatedExpression = result.error;
                } else {
                    this.evaluatedExpression = result.output;
                }
            });
    }

    private cancel() {
        this.editor.setText(this.initialExpressionScript);
        this.codeToEvaluate = this.initialExpressionScript;
        this.expressionSidebarService.closeExpressionEditor();
    }

    private save() {
        if (this.evaluatedExpression === "undefined" || this.evaluatedExpression === "null") {
            this.newValueStream.next("");
        } else {
            this.newValueStream.next(new ExpressionModel({
                script: this.codeToEvaluate,
                expressionValue: this.evaluatedExpression
            }));
        }
    }

    private removeSandboxSub() {
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

//@todo remove update button when expression is evaluated
//@todo add update button when expression is changed
//@todo evaluate expression in input field, populate result before expression editor is loaded