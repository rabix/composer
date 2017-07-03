import {Injectable} from "@angular/core";
import {FormControl} from "@angular/forms";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {AppSaver} from "./app-saver.interface";

@Injectable()
export class PlatformAppSavingService implements AppSaver {

    constructor(private platformRepository: PlatformRepositoryService,
                private modal: ModalService) {
    }

    save(appID: string, content: string, revisionNote?: string): Promise<any> {

        if (revisionNote !== undefined) {
            return this.saveWithNote(appID, content, revisionNote);
        }


        const revisionNoteControl = new FormControl("");

        return this.modal.prompt({
            title: "Publish New App Revision",
            content: "Revision Note:",
            cancellationLabel: "Cancel",
            confirmationLabel: "Publish",
            formControl: revisionNoteControl
        }).then(() => this.saveWithNote(appID, content, revisionNoteControl.value));
    };

    private saveWithNote(appID: string, content: string, revisionNote: string): Promise<any> {
        return this.platformRepository.saveAppRevision(appID, content, revisionNote);
    }
}
