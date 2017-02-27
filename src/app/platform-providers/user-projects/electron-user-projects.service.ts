import {Injectable} from "@angular/core";
import {noop} from "../../lib/utils.lib";
import {MenuItem} from "../../core/ui/menu/menu-item";
import {UserProjectsService} from "./user-projects.service";
import {LocalDataSourceService} from "../../sources/local/local.source.service";

const {app, dialog} = window["require"]("electron").remote;

@Injectable()
export class ElectronUserProjectsService extends UserProjectsService {

    constructor(private fs: LocalDataSourceService) {
        super();
    }

    public getContextMenu(name, content): MenuItem[] {

        return [
            new MenuItem("Copy to Local Files...", {
                click: () => {

                    dialog.showSaveDialog({
                        title: "Choose a Name",
                        defaultPath: `${app.getPath("home")}/${name}.json`,
                        buttonLabel: "Copy"
                    }, path => {
                        if (!path) {
                            return;
                        }

                        content.first()
                            .switchMap(cont => this.fs.createFile(path, cont)
                                .catch(() => this.fs.getContentSavingFunction(path)(cont)))
                            .subscribe(noop, error => dialog.showErrorBox("Error!", error));
                    });
                }
            })
        ];
    }
}
