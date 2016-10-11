import {Component} from "@angular/core";
import {InputInspectorComponent} from "./input-inspector.component";
import {InputSidebarService} from "../../../services/sidebars/input-sidebar.service";

@Component({
    selector: "input-inspector-sidebar-component",
    directives: [
        InputInspectorComponent
    ],
    template: `
            <div class="sidebar-component">
                <div class="collapse-icon" (click)="collapseSidebar()">
                    <i class="fa fa-lg fa-caret-left black"></i>
                </div>
                
                <input-inspector>
                </input-inspector>
            </div>
    `
})
export class InputInspectorSidebarComponent {

    constructor(private inputSidebarService: InputSidebarService) { }

    private collapseSidebar(): void {
        this.inputSidebarService.closeInputInspector();
    }
}
