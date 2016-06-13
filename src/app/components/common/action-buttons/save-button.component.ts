import {Component, Input} from "@angular/core";
import {ActionButtonComponent} from "./action-button.component";
import {FileApi} from "../../../services/api/file.api";
import {FileModel} from "../../../store/models/fs.models";
import {BehaviorSubject} from "rxjs/Rx";

@Component({
    selector: 'save-button',
    template: `
        <action-button class="nav-link" 
                        title="Save" 
                        iconClass="fa fa-save fa-lg"
                        (click)="save()">
        </action-button>
    `,
    providers: [FileApi],
    directives: [ActionButtonComponent]
})
export class SaveButtonComponent {
    @Input() file: BehaviorSubject<FileModel>;
    
    constructor(private fileApi: FileApi) {}
    
    save():void {
        let file = this.file.getValue();

        //@todo(maya) move to a more global service like FileEffects, or something else if removing store 
        this.fileApi.updateFile(file.getRelativePath(), file.getContent()).subscribe(resp => {
            //@todo(maya) implement global notification system
            console.log('Update file response', resp);
        }, err => {
            //@todo(maya) implement global error handling for API calls
            console.log('Update file error', err);
        });
    }

}