import {Component, Input, ViewEncapsulation} from "@angular/core";
import {WorkflowModel} from "cwlts/models";
import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";

@Component({
    encapsulation: ViewEncapsulation.None,

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
                        <div class="container">
                            <!--List Header Row-->
                            <div class="gui-section-list-title row">
                                <div class="col-sm-6">ID</div>
                                <div class="col-sm-6">Run</div>
                            </div>

                            <!--Output List Entries-->
                            <ul class="gui-section-list">

                                <!--List Entry-->
                                <li *ngFor="let entry of model.steps; let i = index"
                                    class="input-list-items container">

                                    <div class="gui-section-list-item clickable row"
                                         [ct-editor-inspector]="inspector"
                                         [ct-editor-inspector-target]="entry.loc"
                                         [ct-validation-class]="entry.validation">

                                        <!--ID Column-->
                                        <div class="col-sm-6" [title]="entry.id">
                                            <ct-validation-preview
                                                [entry]="entry.validation"></ct-validation-preview>
                                            {{ entry.id }}
                                            <br>
                                        </div>
                                        <!--RUN Column-->
                                        <div class="col-sm-6">
                                            {{ entry.run?.class }}: {{ entry.label || entry.run?.label || entry.run?.id }}
                                        </div>
                                    </div>

                                    <!--Object Inspector Template -->
                                    <template #inspector>
                                        <ct-editor-inspector-content>
                                            <div class="tc-header">
                                                <ct-tree-node-icon [type]="entry.run?.class" class="align-icon-height"></ct-tree-node-icon>
                                                <span>{{ entry.label || entry.id || entry.loc || "Step" }}</span>
                                            </div>
                                            <div class="tc-body">
                                                <ct-workflow-step-inspector
                                                    [step]="entry"
                                                    [workflowModel]="model">
                                                </ct-workflow-step-inspector>
                                            </div>
                                        </ct-editor-inspector-content>
                                    </template>
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
                        <div class="container">
                            <!--List Header Row-->
                            <div class="gui-section-list-title row">
                                <div class="col-sm-6">ID</div>
                                <div class="col-sm-6">Type</div>
                            </div>

                            <!--Output List Entries-->
                            <ul class="gui-section-list">

                                <!--List Entry-->
                                <li *ngFor="let entry of model.inputs; let i = index"
                                    class="input-list-items container">

                                    <div class="gui-section-list-item clickable row"
                                         [ct-editor-inspector]="inspector"
                                         [ct-editor-inspector-target]="entry.loc"
                                         [ct-validation-class]="entry.validation">

                                        <!--ID Column-->
                                        <div class="col-sm-6 ellipsis" [title]="entry.id">
                                            <ct-validation-preview
                                                [entry]="entry.validation"></ct-validation-preview>
                                            {{ entry.id }}
                                        </div>

                                        <!--Type Column-->
                                        <div class="col-sm-6 ellipsis">
                                            {{ entry.type | commandParameterType }}
                                        </div>

                                    </div>


                                    <!--Object Inspector Template -->
                                    <template #inspector>
                                        <ct-editor-inspector-content>
                                            <div class="tc-header">{{ entry.id || entry.loc || "Input" }}</div>
                                            <div class="tc-body">
                                                <ct-workflow-io-inspector
                                                    [port]="entry"
                                                    [workflowModel]="model">
                                                </ct-workflow-io-inspector>
                                            </div>
                                        </ct-editor-inspector-content>
                                    </template>
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
                        <div class="container">
                            <!--List Header Row-->
                            <div class="gui-section-list-title row">
                                <div class="col-sm-6">ID</div>
                                <div class="col-sm-6">Type</div>
                            </div>

                            <!--Output List Entries-->
                            <ul class="gui-section-list">

                                <!--List Entry-->
                                <li *ngFor="let entry of model.outputs; let i = index"
                                    class="input-list-items container">

                                    <div class="gui-section-list-item clickable row"
                                         [ct-editor-inspector]="inspector"
                                         [ct-editor-inspector-target]="entry.loc"
                                         [ct-validation-class]="entry.validation">

                                        <!--ID Column-->
                                        <div class="col-sm-6 ellipsis" [title]="entry.id">
                                            <ct-validation-preview
                                                [entry]="entry.validation"></ct-validation-preview>
                                            {{ entry.id }}
                                        </div>

                                        <!--Type Column-->
                                        <div class="col-sm-6 ellipsis">
                                            {{ entry.type | commandParameterType }}
                                        </div>

                                    </div>

                                    <!--Object Inspector Template -->
                                    <template #inspector>
                                        <ct-editor-inspector-content>
                                            <div class="tc-header">{{ entry.id || entry.loc || "Output" }}</div>
                                            <div class="tc-body">
                                                <ct-workflow-io-inspector [port]="entry"
                                                                          [workflowModel]="model">
                                                </ct-workflow-io-inspector>
                                            </div>
                                        </ct-editor-inspector-content>
                                    </template>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ct-form-panel>
            </div>
        </div>
    `
})
export class WorkflowNotGraphEditorComponent {
    @Input()
    readonly: boolean;

    @Input()
    model: WorkflowModel;


    constructor(private inspector: EditorInspectorService) {
    }

    ngOnDestroy() {
        /* Close object inspector*/
        this.inspector.hide();
    }
}
