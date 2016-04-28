import {Component, OnInit} from "angular2/core";
import {EditorSidebarComponent} from "../components/editor-sidebar/editor-sidebar.component";
import {WorkspaceLayoutComponent} from "../components/workspace/workspace.component";

require("./../../assets/sass/main.scss");
require("./main.component.scss");

@Component({
    selector: "cottontail",
    template: `
        <section class="editor-container">
            <editor-sidebar></editor-sidebar>
            <workspace></workspace>
            <div id="aceContainer" style="z-index: 10; position: absolute; top: 20px; left: 90px; width: 295px; height: 500px;"></div>
        </section>
    `,
    directives: [EditorSidebarComponent, WorkspaceLayoutComponent]
})
export class MainComponent implements OnInit {

    constructor() {
    }

    ngOnInit(): any {

        console.log('Ace', ace.edit("aceContainer"));
    }
}
