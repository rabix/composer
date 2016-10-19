export const PANEL_USER_PROJECTS = "sb_user_projects";
export const PANEL_PUBLIC_APPS   = "sb_public_apps";
export const PANEL_LOCAL_FILES   = "local_files";
export const PANEL_STRUCTURE     = "structure";
export const PANEL_REVISIONS     = "revisions";

export type PanelGroupMap = { [region: string]: PanelGroup; };

export class PanelStatus {

    public constructor(public id: string,
                       public name: string,
                       public icon = "",
                       public active = false,
                       public shortcut: string) {
    }
}

export class PanelGroup {
    public panels: PanelStatus[] = [];

    constructor(panels?: PanelStatus[]) {
        this.panels = panels;
    }

    public toggle(id: string) {
        const index = this.panels.findIndex(p => p.id === id);

        // If the panel doesn't exist, throw an exception, it's probably a mistake in the code
        if (index === -1) {
            throw `Trying to toggle non-existing panel “${id}”.
                   Available panels are ${this.panels.map(p => p.id).join(", ")}`;
        }

        const isActive = this.panels[index].active;

        // As a start, all panels should get deactivated
        this.panels = this.panels.map(p => Object.assign(p, {active: false}));

        if (!isActive) {
            this.panels[index].active = true;
        }

    }

    public find(id: string) {
        return this.panels.find(p => p.id === id);
    }

    public has(id: string) {
        return !!this.find(id);
    }
}