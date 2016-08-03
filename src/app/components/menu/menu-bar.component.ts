import {Component} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileModel} from "../../store/models/fs.models";
import {MenuComponent} from "./menu.component";
import {MenuItemComponent} from "./menu-item.component";
import {MenuItem} from "./menu-item";
import {ModalService} from "../modal";
import {NewFileModalComponent} from "../common/new-file-modal.component";
import {SaveAsModalComponent} from "../common/save-as-modal.component";
import {SaveFileRequestAction} from "../../action-events/index";
import {WorkspaceService} from "../workspace/workspace.service";

require("./menu-bar.component.scss");

@Component({
    selector: "ct-menu-bar",
    directives: [MenuComponent, MenuItemComponent],
    template: `
        <ct-menu-item *ngFor="let item of menuItems" [item]="item"></ct-menu-item>
    `
})
export class MenuBarComponent {

    public menuItems: MenuItem[];

    private selectedFile: FileModel;

    constructor(private workspace: WorkspaceService,
                private modal: ModalService,
                private eventHub: EventHubService) {


        workspace.selectedFile.subscribe(file => this.selectedFile = file);
        const fileSelectionExists = workspace.selectedFile.map(f => !!f);

        const fileMenu = new MenuItem("File", {}, [
            new MenuItem("New...", {
                click: () => this.modal.show(NewFileModalComponent, {
                    title: "New File",
                    closeOnOutsideClick: false
                }),
            }),
            new MenuItem("Save", {
                isEnabled: fileSelectionExists,
                click: () => {
                    this.eventHub.publish(new SaveFileRequestAction(this.selectedFile));
                }
            }),
            new MenuItem("Save As...", {
                isEnabled: fileSelectionExists,
                click: () => this.modal.show(SaveAsModalComponent, {
                    title: "Save",
                    closeOnOutsideClick: false,
                    componentState: {
                        filePath: this.selectedFile.absolutePath,
                    },
                })
            })
        ]);

        const projectMenu = new MenuItem("Project", {}, [
            new MenuItem("Apps", {}, [
                new MenuItem("Public Apps"),
                new MenuItem("Private Apps"),
                new MenuItem("Import Docker Image...")
            ])
        ]);

        const sbgMenu = new MenuItem("Seven Bridges", {}, [
            new MenuItem("Log In...")
        ]);

        this.menuItems = [fileMenu, projectMenu, sbgMenu];
    }

}
