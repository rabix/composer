import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModalService} from "../../../../ui/modal/modal.service";
import {AddSourceModalComponent} from "../../../../core/modals/add-source-modal/add-source-modal.component";
import {AuthService} from "../../../../auth/auth.service";
import {skip, take} from "rxjs/operators";

@Component({
    selector: "ct-get-started-notification",
    template: `
        You’ve connected your {{environment}} account ({{username}}) to the Rabix Composer.
        Get started by
        <button class="btn-inline-link" (click)="openProject()" data-test="get-started-notification-open-project">opening a project.
        </button>
    `
})
export class GetStartedNotificationComponent implements OnInit {

    @Input()
    environment: string;

    @Input()
    username: string;

    @Output()
    dismiss = new EventEmitter();

    constructor(private modal: ModalService, private auth: AuthService) {
    }

    ngOnInit() {
        this.auth.getActive().pipe(
            skip(1),
            take(1)
        ).subscribe(() => {
            this.dismiss.next();
        });
    }

    openProject() {
        const component = this.modal.fromComponent(AddSourceModalComponent, "Open a Project");
        component.activeTab = "platform";
    }
}
