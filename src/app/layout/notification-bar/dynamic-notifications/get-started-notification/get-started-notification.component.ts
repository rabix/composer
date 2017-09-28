import {Component, Input} from "@angular/core";
import {ModalService} from "../../../../ui/modal/modal.service";
import {AddSourceModalComponent} from "../../../../core/modals/add-source-modal/add-source-modal.component";
import {DynamicNotification} from "../dynamic-notification.interface";

@Component({
    selector: "ct-get-started-notification",
    styleUrls: ["get-started-notification.component.scss"],
    template: `
        You’ve connected your {{componentInputs.environment}} account ({{componentInputs.account}}) to the Rabix Composer.
        Get started by <button class="open-project-btn" (click)="openProject()">opening a project.</button>
    `
})
export class GetStartedNotificationComponent implements DynamicNotification {

    @Input()
    componentInputs: { [key: string]: any } = {};

    constructor(private modal: ModalService) {
    }

    openProject() {
        const component = this.modal.fromComponent(AddSourceModalComponent, "Open a Project");
        component.activeTab = "platform";
    }
}
