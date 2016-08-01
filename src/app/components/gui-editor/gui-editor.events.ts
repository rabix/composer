import {SidebarType} from "./sidebar/editor-sidebar.component";

export enum GuiEditorEventType {
    showSidebar
}

export interface ShowSidebarEvent {
    data: {
        sidebarType: SidebarType
    }
}
