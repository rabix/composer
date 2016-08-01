import {SidebarType} from "./sidebar/editor-sidebar.component";
export enum GuiEditorEventType {
    showSidebar
}

export interface GuiEditorEvent {
    type: GuiEditorEventType,
    data: Object
}

export interface ShowSidebarEvent extends GuiEditorEvent {
    data: {
        sidebarType: SidebarType
    }
}
