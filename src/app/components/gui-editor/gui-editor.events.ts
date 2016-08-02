import {SidebarType} from "./sidebar/editor-sidebar.component";

export enum GuiEditorEventType {
    ShowSidebar
}

export interface ShowSidebarEvent {
    data: {
        sidebarType: SidebarType
    }
}
