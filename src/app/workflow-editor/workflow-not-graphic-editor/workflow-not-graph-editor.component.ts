import {ChangeDetectionStrategy, Component, Input, OnDestroy} from "@angular/core";
import {WorkflowModel} from "cwlts/models";
import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-workflow-not-graph-editor",
    styleUrls: ["./workflow-not-graph-editor.component.scss"],
    template: `
        <div class="row">

            <div class="col-xs-12">
                <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Steps
            </span>

                    <div class="tc-body">
                        <div>
                            <!--List Header Row-->
                            <div class="editor-list-title row">
                                <div class="col-sm-6">ID</div>
                                <div class="col-sm-6">Run</div>
                            </div>

                            <!--Output List Entries-->
                            <ul class="ml-1 mr-1">

                                <!--List Entry-->
                                <li *ngFor="let entry of model.steps"
                                    class="input-list-items">

                                    <div class="editor-list-item clickable row"
                                         [ct-editor-inspector]="inspector"
                                         [ct-editor-inspector-target]="entry.loc"
                                         [ct-validation-class]="entry">

                                        <!--ID Column-->
                                        <div class="col-sm-6" [title]="entry.id">
                                            <ct-validation-preview
                                                [entry]="entry"></ct-validation-preview>
                                            {{ entry.id }}
                                            <br>
                                        </div>
                                        <!--RUN Column-->
                                        <div class="col-sm-6">
                                            {{ entry.run?.class }}: {{ entry.label || entry.run?.label || entry.run?.id }}
                                        </div>
                                    </div>

                                    <!--Object Inspector Template -->
                                    <ng-template #inspector>
                                        <ct-editor-inspector-content>
                                            <div class="tc-header">
                                                <span>{{ entry.label || entry.id || entry.loc || "Step" }}</span>
                                            </div>
                                            <div class="tc-body">
                                                <ct-workflow-step-inspector
                                                    [step]="entry"
                                                    [graph]="mockGraph"
                                                    [workflowModel]="model">
                                                </ct-workflow-step-inspector>
                                            </div>
                                        </ct-editor-inspector-content>
                                    </ng-template>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ct-form-panel>


                <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Inputs
            </span>

                    <div class="tc-body">
                        <div>
                            <!--List Header Row-->
                            <div class="editor-list-title row">
                                <div class="col-sm-6">ID</div>
                                <div class="col-sm-6">Type</div>
                            </div>

                            <!--Output List Entries-->
                            <ul class="ml-1 mr-1">

                                <!--List Entry-->
                                <li *ngFor="let entry of model.inputs"
                                    class="input-list-items">

                                    <div class="editor-list-item clickable row"
                                         [ct-editor-inspector]="inspector"
                                         [ct-editor-inspector-target]="entry.loc"
                                         [ct-validation-class]="entry">

                                        <!--ID Column-->
                                        <div class="col-sm-6 ellipsis" [title]="entry.id">
                                            <ct-validation-preview
                                                [entry]="entry"></ct-validation-preview>
                                            {{ entry.id }}
                                        </div>

                                        <!--Type Column-->
                                        <div class="col-sm-6 ellipsis">
                                            {{ entry.type | commandParameterType }}
                                        </div>

                                    </div>


                                    <!--Object Inspector Template -->
                                    <ng-template #inspector>
                                        <ct-editor-inspector-content>
                                            <div class="tc-header">{{ entry.id || entry.loc || "Input" }}</div>
                                            <div class="tc-body">
                                                <ct-workflow-io-inspector
                                                    [port]="entry"
                                                    [graph]="mockGraph"
                                                    [workflowModel]="model">
                                                </ct-workflow-io-inspector>
                                            </div>
                                        </ct-editor-inspector-content>
                                    </ng-template>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ct-form-panel>

                <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Outputs
            </span>

                    <div class="tc-body">
                        <div>
                            <!--List Header Row-->
                            <div class="editor-list-title row">
                                <div class="col-sm-6">ID</div>
                                <div class="col-sm-6">Type</div>
                            </div>

                            <!--Output List Entries-->
                            <ul class="ml-1 mr-1">

                                <!--List Entry-->
                                <li *ngFor="let entry of model.outputs"
                                    class="input-list-items">

                                    <div class="editor-list-item clickable row"
                                         [ct-editor-inspector]="inspector"
                                         [ct-editor-inspector-target]="entry.loc"
                                         [ct-validation-class]="entry">

                                        <!--ID Column-->
                                        <div class="col-sm-6 ellipsis" [title]="entry.id">
                                            <ct-validation-preview
                                                [entry]="entry"></ct-validation-preview>
                                            {{ entry.id }}
                                        </div>

                                        <!--Type Column-->
                                        <div class="col-sm-6 ellipsis">
                                            {{ entry.type | commandParameterType }}
                                        </div>

                                    </div>

                                    <!--Object Inspector Template -->
                                    <ng-template #inspector>
                                        <ct-editor-inspector-content>
                                            <div class="tc-header">{{ entry.id || entry.loc || "Output" }}</div>
                                            <div class="tc-body">
                                                <ct-workflow-io-inspector [port]="entry"
                                                                          [workflowModel]="model">
                                                </ct-workflow-io-inspector>
                                            </div>
                                        </ct-editor-inspector-content>
                                    </ng-template>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ct-form-panel>
            </div>
        </div>
    `
})
export class WorkflowNotGraphEditorComponent implements OnDestroy {
    @Input()
    readonly: boolean;

    @Input()
    model: WorkflowModel;

    mockGraph = {redraw: () => void 0};

    constructor(public inspector: EditorInspectorService) {
    }

    ngOnDestroy() {
        /* Close object inspector*/
        this.inspector.hide();
    }
}
