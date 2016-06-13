import {Component} from "@angular/core";
import {NewFileButtonComponent} from "../common/action-buttons/new-file-button.component";
import {SaveAsButtonComponent} from "../common/action-buttons/save-as-button.component";
import {Store} from "@ngrx/store";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {AsyncPipe} from "@angular/common";
import {FileRegistry} from "../../services/file-registry.service";
import {FileModel} from "../../store/models/fs.models";

require("./action-panel.component.scss");

@Component({
    selector: "action-panel",
    directives: [NewFileButtonComponent, SaveAsButtonComponent],
    template: `
    <nav>
        <new-file-button></new-file-button>   
        <save-as-button
            *ngIf="selectedFileContent | async"
            [content]="selectedFileContent"
        ></save-as-button>
    </nav>
       `,
    pipes: [AsyncPipe],
    providers: [],
})
export class ActionPanelComponent {
    private selectedFileContent: Observable<string>;
    private selectedFileSubject: BehaviorSubject<string>;

    constructor(private store: Store, private registry: FileRegistry) {
        this.selectedFileSubject = new BehaviorSubject(null);
        
        this.selectedFileContent = <Observable<string>> this.store.select('selectedFile')
            .filter(file => file)
            .switchMap((file: FileModel) => {
                return registry.loadFile(file.getAbsolutePath()).map(change => {
                    file.setContent(change.content);
                    return file;
                });
            });

        this.selectedFileContent.subscribe(this.selectedFileSubject);
    }
}
