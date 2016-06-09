import {Component} from "@angular/core";
import {NewFileButtonComponent} from "../common/action-buttons/new-file-button.component";
import {SaveAsButtonComponent} from "../common/action-buttons/save-as-button.component";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Rx";
import {AsyncPipe} from "@angular/common";
import {FileRegistry} from "../../services/file-registry.service";

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
    private selectedFileContent:any;

    constructor(private store: Store, private registry: FileRegistry) {
        this.store.select('selectedFile')
            .filter(file => file)
            .switchMap((file) => {
                return registry.loadFile(file.getAbsolutePath());
            })
            .map(change => {
                return change.content
            }).subscribe();

        debugger;
    }
}
