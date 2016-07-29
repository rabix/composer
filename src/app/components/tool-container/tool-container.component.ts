import {Component, OnInit} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault, NgSelectOption} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {GuiEditorComponent} from "../gui-editor/gui-editor.component";
import * as templateHtml from "./tool-container.html";
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {FileRegistry} from "../../services/file-registry.service";
import {Subscription} from "rxjs/Rx";

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
    template: templateHtml
})
export class ToolContainerComponent implements OnInit, DynamicState {
    viewMode: string = "gui";
    file: FileModel;

    /* TODO: load actual revisions */
    revisions: Array<string> = ["rev1", "rev2", "rev3"];
    selectedRevision: string = this.revisions[0];

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[];

    constructor(private fileRegistry: FileRegistry) {
        this.subs = [];
    }

    ngOnInit(): void {
        // This file that we need to show, check it out from the file repository
        const fileStream = this.fileRegistry.getFile(this.file);

        // bring our own file up to date
        this.subs.push(fileStream.subscribe(file => {
            this.file     = file;
        }));
    }

    onChange(e): void {
        this.selectedRevision = e.target.value;
    }

    setViewMode(viewMode): void {
        this.viewMode = viewMode;
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
