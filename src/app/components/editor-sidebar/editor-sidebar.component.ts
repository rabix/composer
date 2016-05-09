import {EditorSidebarItemComponent} from "./editor-sidebar-item/editor-sidebar-item.component";
import {Component} from "@angular/core";
import {FileApi} from "../../api/file.api";
import { HTTP_PROVIDERS } from '@angular/http';

require("./editor-sidebar.component.scss");

// @WorkspaceComponent({
//     name: "Good Title"
// })
@Component({

    selector: "editor-sidebar",
    directives: [EditorSidebarItemComponent],
    template: `
            <nav>
                <editor-sidebar-item title="Project" icon="files-o"></editor-sidebar-item>
                <editor-sidebar-item title="Apps" icon="sitemap"></editor-sidebar-item>
                <editor-sidebar-item title="Settings" icon="cog"></editor-sidebar-item>
            </nav>
    `,
    providers:  [
        HTTP_PROVIDERS,
        FileApi
    ]
})
export class EditorSidebarComponent {

    constructor (private fileApi: FileApi) {}

    ngOnInit() { this.getFilesInWorkspace(); }

    getFilesInWorkspace() {
        this.fileApi.getFilesInWorkspace()
            .subscribe(
                result => {
                    //this.heroes = result
                    console.log(result);
                },
                error => {
                    console.log(error);
                    //this.errorMessage = <any>error
                });
    }

}
