import {Component} from "@angular/core";
import {NewFileButtonComponent} from "../common/action-buttons/new-file-button.component";
import {SaveAsButtonComponent} from "../common/action-buttons/save-as-button.component";
import {Store} from "@ngrx/store";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {AsyncPipe} from "@angular/common";
import {FileRegistry} from "../../services/file-registry.service";
import {FileModel} from "../../store/models/fs.models";
import {SaveButtonComponent} from "../common/action-buttons/save-button.component";

require("./action-panel.component.scss");

@Component({
    selector: "action-panel",
    directives: [NewFileButtonComponent, SaveAsButtonComponent, SaveButtonComponent],
    template: `
    <nav>
        <new-file-button></new-file-button>   
        <save-as-button
            *ngIf="selectedFile | async"
            [content]="selectedFileSubject"
        ></save-as-button>
        <save-button
            *ngIf="selectedFile | async"
            [file]="selectedFileSubject"
        ></save-button>
    </nav>
       `,
    pipes: [AsyncPipe],
    providers: [],
})
export class ActionPanelComponent {
    private selectedFileContent: Observable<string>;
    private selectedFileSubject: BehaviorSubject<FileModel>;
    private selectedFile: Observable<FileModel>;

    constructor(private store: Store, private registry: FileRegistry) {
        this.selectedFileSubject = new BehaviorSubject(null);
        
        this.selectedFile = <Observable<FileModel>> this.store.select('selectedFile')
            .filter(file => file)
            .switchMap((file: FileModel) => {
                return registry.loadFile(file.absolutePath).map(change => {
                    file.content = change.content;
                    return file;
                });
            });
        
        this.selectedFile.subscribe(this.selectedFileSubject);
    }
}
