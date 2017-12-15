import {Component, Input} from "@angular/core";

@Component({
    selector: "ct-common-document-controls",
    template: `
        <div class="document-controls">

            <ng-container *ngIf="host.viewMode !== 'test'; else testControls">

                <!--Edit-->
                <button *ngIf="host.isUnlockable"
                        class="btn control-button"
                        type="button"
                        ct-tooltip="Unlock this app for editing"
                        tooltipPlacement="bottom"

                        (click)="host.unlockEditing()">
                    <i class="fa fa-fw fa-lock"></i> Edit
                </button>

                <!--Resolve-->
                <button class="btn control-button"
                        type="button"
                        [disabled]="!host.appIsResolvable()"
                        *ngIf="host.viewMode === 'code' && host.tabData.dataSource === 'local'"
                        ct-tooltip="Resolve"
                        tooltipPlacement="bottom"
                        (click)="host.resolveCurrentContent()">
                    <i class="fa fa-fw fa-refresh"></i>
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


                <!--Save-->
                <button *ngIf="host.tabData.isWritable"
                        [disabled]="!host.appIsSavable()"
                        (click)="host.save()"
                        ct-tooltip="Save"
                        tooltipPlacement="bottom"
                        data-test="save-button"
                        class="btn control-button" type="button">
                    <i class="fa fa-fw fa-save"></i>
                </button>

                <button [disabled]="!host.dataModel"
                        type="button" 
                        class="btn control-button" 
                        ct-tooltip="Export App" 
                        tooltipPlacement="bottom" 
                        (click)="host.exportApp()">
                    <i class="fa fa-fw fa-upload"></i>
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


                <!--Revisions-->
                <button
                    *ngIf="host.tabData.dataSource !== 'local' && host.dataModel && host.dataModel.customProps['sbg:revisionsInfo']"
                    data-test="revision-button"
                    class="btn control-button" type="button"
                    ct-tooltip="See Revision History"
                    tooltipPlacement="bottom"
                    [ct-editor-inspector-target]="'revisions'"
                    [ct-editor-inspector]="revisions">

                    Revision: {{ host.dataModel.customProps['sbg:revision']}}

                    <ng-template #revisions>
                        <ct-revision-list *ngIf="host.dataModel" [active]="host.dataModel.customProps['sbg:revision']"
                                          #revisionList
                                          [beforeChange]="host.showModalIfAppIsDirtyBound"
                                          [revisions]="host.dataModel.customProps['sbg:revisionsInfo']"
                                          (select)="host.openRevision($event)">
                        </ct-revision-list>
                    </ng-template>
                </button>

            </ng-container>

            <ng-template #testControls>

                <button type="button" class="btn control-button" ct-tooltip="Import Job" tooltipPlacement="bottom" (click)="host.importJob()">
                    <i class="fa fa-fw fa-download"></i>
                </button>
                
                <button type="button" class="btn control-button" ct-tooltip="Export Job" tooltipPlacement="bottom" (click)="host.exportJob()">
                    <i class="fa fa-fw fa-upload"></i>
                </button>

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


            <!--<ct-generic-dropdown-menu [ct-menu]="moreActionsMenu" menuAlign="left" #moreActionsDropdown>-->
            <!--<button class="btn control-button"-->
            <!--*ngIf="host.appIsRunnable()"-->
            <!--ct-tooltip="See More Actions"-->
            <!--tooltipPlacement="bottom"-->
            <!--(click)="moreActionsDropdown.show()">-->
            <!--<i class="fa fa-fw fa-ellipsis-v"></i>-->
            <!--</button>-->
            <!--</ct-generic-dropdown-menu>-->

            <!--<ng-template #moreActionsMenu class="mr-1">-->
            <!--<ul class="list-unstyled dropdown-list">-->
            <!--<li class="list-item" (click)="moreActionsDropdown.hide(); host.editRunConfiguration()">-->
            <!--Edit Run Configuration-->
            <!--</li>-->
            <!--</ul>-->
            <!--</ng-template>-->

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
