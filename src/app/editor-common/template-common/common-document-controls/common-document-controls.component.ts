import {Component, Input} from "@angular/core";

@Component({
    selector: "ct-common-document-controls",
    template: `
        <div class="document-controls">


            <!--Run-->
            <button type="button" class="btn btn-secondary"
                    *ngIf="(host.executor.getExecutorState() | async) !== 'UNSET' && host.viewMode === 'test'"
                    [disabled]="!host.appIsRunnable() && (host.executor.getExecutorState() | async) === 'INVALID'"
                    ct-tooltip="Run with Rabix Executor"
                    tooltipPlacement="bottom"
                    (click)="host.scheduleExecution()">
                <i class="fa fa-fw fa-play"></i>
            </button>

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
                    data-test="save-btn"
                    class="btn control-button" type="button">
                <i class="fa fa-fw fa-save"></i>
            </button>

            <!--Push to Platform-->
            <button class="btn control-button" data-test="publish-btn"
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
                data-test="revision-btn"
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

            <ct-generic-dropdown-menu [ct-menu]="moreActionsMenu" menuAlign="left" #moreActionsDropdown>
                <button class="btn control-button"
                        *ngIf="host.appIsRunnable()"
                        ct-tooltip="See More Actions"
                        tooltipPlacement="bottom"
                        (click)="moreActionsDropdown.show()">
                    <i class="fa fa-fw fa-ellipsis-v"></i>
                </button>
            </ct-generic-dropdown-menu>

            <ng-template #moreActionsMenu class="mr-1">
                <ul class="list-unstyled dropdown-list">
                    <li class="list-item" (click)="moreActionsDropdown.hide(); host.editRunConfiguration()">
                        Edit Run Configuration
                    </li>
                </ul>
            </ng-template>

        </div>
    `,
    styleUrls: ["./common-document-controls.scss"],
})
export class CommonDocumentControlsComponent {

    @Input()
    host: any;
}
