import {EditorSidebarItemComponent} from "./editor-sidebar-item/editor-sidebar-item.component";
import {Component} from "@angular/core";
import {HTTP_PROVIDERS} from '@angular/http';
import {ActionButtonComponent} from '../common/action-button/action-button.component'
import {ACTION_BUTTON_TYPE} from '../common/action-button/action-button-type'

require("./editor-sidebar.component.scss");

// @WorkspaceComponent({
//     name: "Good Title"
// })
@Component({

    selector: "editor-sidebar",
    directives: [EditorSidebarItemComponent, ActionButtonComponent],
    template: `
            <nav>
                <action-button title="Project" buttonType="{{ACTION_BUTTON_TYPE.SIDEBAR_ITEM}}" 
                                iconClass="fa fa-files-o fa-2x"></action-button>
                                
                <action-button title="Apps" buttonType="{{ACTION_BUTTON_TYPE.SIDEBAR_ITEM}}" 
                                iconClass="fa fa-sitemap fa-2x"></action-button>
                                
                <action-button title="Settings"  buttonType="{{ACTION_BUTTON_TYPE.SIDEBAR_ITEM}}" 
                                iconClass="fa fa-cog fa-2x"></action-button>
            </nav>
    `,
    providers: [HTTP_PROVIDERS]
})
export class EditorSidebarComponent {
    private ACTION_BUTTON_TYPE;

    constructor() {
        this.ACTION_BUTTON_TYPE = ACTION_BUTTON_TYPE;
    }
}
