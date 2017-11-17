import {Component, Input} from "@angular/core";
import {WorkflowEditorComponent} from "../../../workflow-editor/workflow-editor.component";
import {AppEditorBase} from "../../app-editor-base/app-editor-base";

@Component({
    selector: "ct-common-status-controls",
    template: `
        <!--Perpetual spinner that indicates if CWL validation is in progress-->
        <!--Same for T/W-->
        <i *ngIf="host.isValidatingCWL" class="fa fa-circle-o-notch fa-spin"></i>

        <!--Indicates that the app is an unlockable copy of another app-->
        <!--Same for T/W-->
        <div *ngIf="host.isReadonly && host.tabData.isWritable" class="tag tag-warning"
             [ct-tooltip]="'This app is a copy of ' +  host.dataModel.customProps['sbg:copyOf']">
            Copy
        </div>

        <!--Shows the CWL version of the app, same for T/W-->
        <!--Same for T/W-->
        <div *ngIf="host.dataModel" class="tag tag-info"
             [ct-tooltip]="'The app is described using the displayed version(s) of CWL'">
            {{ host.dataModel.cwlVersion }}
        </div>


        <!--Button section on bottom right-->
        <!--Almost same for T/W-->
        <div class="btn-group">

            <!--Execution Button-->
            <!--Same for T/W-->
            <button *ngIf="host.showExecutionReportPanel"
                    (click)="host.toggleReport('execution')"
                    [class.active]="host.reportPanel === 'execution'"
                    class="btn">
                <ct-circular-loader *ngIf="host.isExecuting" class="loader-25 execution-loader"></ct-circular-loader>
                Execution
            </button>

            <!--Validation Button-->
            <!--Same for T/W-->
            <button [disabled]="!host.validationState"
                    [class.active]="host.reportPanel === 'validation'"
                    (click)="host.toggleReport('validation')"
                    class="btn">

                <!--Error sign-->
                <span *ngIf="host.validationState?.errors?.length">
                    <i class="fa fa-times-circle text-danger"></i> 
                    {{ host.validationState.errors.length }} 
                    {{ host.validationState.errors.length === 1 ? "Error" : "Errors" }}
                </span>

                <!--Warning sign-->
                <span *ngIf="host.validationState?.warnings?.length" [class.pl-1]="host.validationState?.errors?.length">
                    <i class="fa fa-exclamation-triangle text-warning"></i>
                    {{ host.validationState.warnings.length }}
                    {{ host.validationState.warnings.length === 1 ? "Warning" : "Warnings" }}
                </span>

                <!--No issues sign-->
                <span *ngIf="!host.validationState?.errors?.length && !host.validationState?.warnings?.length">
                    No Issues
                </span>
            </button>

            <!--Command Line Preview Button-->
            <!--Only for CommandLineTool-->
            <button *ngIf="appType === 'CommandLineTool'"
                    [class.active]="host.reportPanel == 'commandLinePreview'"
                    [disabled]="!host.validationState?.isValidCWL"
                    (click)="host.toggleReport('commandLinePreview')"
                    class="btn">Command Line
            </button>


        </div>

    `,
    styleUrls: ["./common-status-controls.component.scss"],
})
export class CommonStatusControlsComponent {

    @Input()
    host: AppEditorBase;

    appType: string;

    ngOnInit() {
        this.appType = this.host instanceof WorkflowEditorComponent
            ? "Workflow"
            : "CommandLineTool";
    }

}
