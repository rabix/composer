import {Component, Input} from "@angular/core";

@Component({
    selector: "ct-common-document-controls",
    template: `
        <div class="document-controls">

            <ng-container *ngIf="host.viewMode !== 'test'; else testControls">

                <!--Revisions-->
                <button
                    *ngIf="host.tabData.dataSource !== 'local' && host.dataModel && host.dataModel.customProps['sbg:revisionsInfo']"
                    data-test="revision-button"
                    class="btn control-button" type="button"
                    ct-tooltip="See Revision History"
                    tooltipPlacement="bottom"
                    [ct-editor-inspector-target]="'revisions'"
                    [ct-editor-inspector]="revisions">
                    <i class="fa fa-fw fa-history"></i>
                    {{ host.dataModel.customProps['sbg:revision']}}

                    <ng-template #revisions>
                        <ct-revision-list *ngIf="host.dataModel" [active]="host.dataModel.customProps['sbg:revision']"
                                          #revisionList
                                          [beforeChange]="host.showModalIfAppIsDirtyBound"
                                          [revisions]="host.dataModel.customProps['sbg:revisionsInfo']"
                                          (select)="host.openRevision($event)">
                        </ct-revision-list>
                    </ng-template>
                </button>

                <!--Go to app-->
                <button class="btn control-button"
                        type="button"
                        [disabled]="host.dataModel === undefined"
                        *ngIf="host.tabData.dataSource !== 'local'"
                        ct-tooltip="Open on Platform"
                        tooltipPlacement="bottom"
                        (click)="host.openOnPlatform(host.dataModel.sbgId)">
                    <i class="fa fa-fw fa-external-link"></i>
                </button>

                <!--Push to Platform-->
                <button class="btn control-button" data-test="publish-button"
                        [disabled]="!host.appIsPublishable()"
                        *ngIf="host.tabData.dataSource === 'local'"
                        ct-tooltip="Push to Platform"
                        tooltipPlacement="bottom"
                        (click)="host.publish()">
                    <i class="fa fa-fw fa-cloud-upload"></i>
                </button>

                <!--Save-->
                <button *ngIf="host.tabData.isWritable && !host.isUnlockable"
                        [disabled]="!host.appIsSavable()"
                        (click)="host.save()"
                        ct-tooltip="Save"
                        tooltipPlacement="bottom"
                        data-test="save-button"
                        class="btn control-button" type="button">
                    <i class="fa fa-fw fa-save"></i>
                </button>

                <!--Edit-->
                <button *ngIf="host.isUnlockable"
                        class="btn control-button"
                        type="button"
                        ct-tooltip="Unlock this app for editing"
                        tooltipPlacement="bottom"

                        (click)="host.unlockEditing()">
                    <i class="fa fa-fw fa-pencil"></i>
                </button>

            </ng-container>

            <ng-template #testControls>

                <!--Run-->
                <button type="button" class="btn btn-primary"
                        *ngIf="!host.isExecuting"
                        [disabled]="!host.appIsRunnable()"
                        ct-tooltip="Run with Rabix Executor"
                        tooltipPlacement="bottom"
                        (click)="host.scheduleExecution()">
                    <i class="fa fa-fw fa-play"></i> Run
                </button>

                <button type="button" class="btn btn-danger"
                        *ngIf="host.isExecuting"
                        ct-tooltip="Stop Execution"
                        tooltipPlacement="bottom"
                        (click)="host.stopExecution()">
                    <i class="fa fa-fw fa-square"></i> Stop
                </button>

            </ng-template>

            <ct-generic-dropdown-menu [ct-menu]="moreActionsMenu" menuAlign="left" #moreActionsDropdown>
                <button class="btn control-button"
                        *ngIf="host.appIsRunnable()"
                        ct-tooltip="See More Actions"
                        tooltipPlacement="bottom"
                        data-test="more-actions-button"
                        (click)="moreActionsDropdown.show()">
                    <i class="fa fa-fw fa-ellipsis-h"></i>
                </button>
            </ct-generic-dropdown-menu>

            <ng-template #moreActionsMenu class="mr-1">
                <ul class="list-unstyled dropdown-list">

                    <ng-container *ngIf="host.viewMode !== 'test'; else testItems">
                        <li class="list-item" (click)="host.exportAppInFormat('json');moreActionsDropdown.hide();">
                            Export into JSON format
                        </li>

                        <li class="list-item" (click)="host.exportAppInFormat('yaml');moreActionsDropdown.hide();">
                            Export into YAML format
                        </li>

                        <li *ngIf="host.isWorkflowModel()" class="list-item"
                            (click)="host.setHints(); moreActionsDropdown.hide();">
                            Set Hints
                        </li>

                        <li *ngIf="host.tabData.dataSource === 'local' && host.viewMode === 'code'" class="list-item"
                            (click)="moreActionsDropdown.hide(); host.resolveCurrentContent()">
                            Resolve
                        </li>
                    </ng-container>

                    <ng-template #testItems>
                        <li class="list-item" (click)="host.exportJob();moreActionsDropdown.hide();">
                            Export Job
                        </li>
                        <li class="list-item" (click)="host.importJob();moreActionsDropdown.hide();">
                            Import Job
                        </li>
                    </ng-template>

                </ul>
            </ng-template>

        </div>
    `,
    styleUrls: ["./common-document-controls.scss"],
})
export class CommonDocumentControlsComponent {
    /**
     * Cannot typehint properly because import would create a circular dependency
     * @type AppEditorBase
     */
    @Input() host;
}
