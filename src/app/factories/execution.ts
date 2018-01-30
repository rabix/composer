import {DirectoryExplorer, TabManager} from "../execution/interfaces";
import {TabData} from "../../../electron/src/storage/types/tab-data-interface";
import {NativeSystemService} from "../native/system/native-system.service";
import {WorkboxService} from "../core/workbox/workbox.service";

export const directoryExplorerFactory = (native: NativeSystemService) => {
    return {
        explore(path: string) {
            return native.exploreFolder(path);
        }
    } as DirectoryExplorer;
};

export const tabManagerFactory = (workspace: WorkboxService) => {
    return {
        getOrCreate(tab: TabData<any>) {
            return workspace.getOrCreateAppTab(tab);
        },
        open(tab: TabData<any>) {
            workspace.openTab(tab, false, true, true);
        }
    } as TabManager;
};
