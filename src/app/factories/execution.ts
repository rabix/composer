import {DirectoryExplorer, FileOpener} from "../execution/interfaces";
import {NativeSystemService} from "../native/system/native-system.service";
import {WorkboxService} from "../core/workbox/workbox.service";

export const directoryExplorerFactory = (native: NativeSystemService) => {
    return {
        explore(path: string) {
            return native.exploreFolder(path);
        }
    } as DirectoryExplorer;
};

export const fileOpenerFactory: (ws: WorkboxService) => FileOpener = (workspace: WorkboxService) => {
    return {
        open(path: string, language: string) {

            const tab = workspace.getOrCreateAppTab({
                id: path,
                label: path,
                type: "Code",
                isWritable: false,
                language: language,
            });

            workspace.openTab(tab, false, true, true);
        },

    };
};
