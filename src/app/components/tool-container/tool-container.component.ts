import {Component, OnInit} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault, NgSelectOption} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {GuiEditorComponent} from "../gui-editor/gui-editor.component";

require("./tool-container.component.scss");

@Component({
    selector: "tool-container",
    directives: [
        CodeEditorComponent,
        GuiEditorComponent,
        BlockLoaderComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        NgSelectOption
    ],
    template: require("./tool-container.html")
})
export class ToolContainerComponent implements OnInit {
    viewMode: string = "gui";
    file: FileModel;

    /* TODO: load actual revisions */
    revisions: Array<string> = ["rev1", "rev2", "rev3"];
    selectedRevision: string = this.revisions[0];

    constructor() {}

    ngOnInit(): void {

    }

    onChange(e): void {
        this.selectedRevision = e.target.value;
    }

    setViewMode(viewMode): void {
        this.viewMode = viewMode;
    }

    public setState(state): void {
        if (state.fileInfo) {
            this.file = state.fileInfo;
        }
    }
}
