import {Injectable} from "@angular/core";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {MenuItem} from "../../components/menu/menu-item";
import {UserProjectsService} from "./user-projects.service";

const {app, dialog} = window.require("electron").remote;

@Injectable()
export class ElectronUserProjectsService extends UserProjectsService {

    constructor (private fs: LocalDataSourceService) {
        super();
    }

    public getContextMenu(name, content): MenuItem[] {
        const items = [];

        const newFile = new MenuItem("Copy to Local Files...", {
            click: () => {
                dialog.showSaveDialog({
                    title: "Choose a Name",
                    defaultPath: [app.getPath("home"), name + ".json"].join("/"),
                    buttonLabel: "Copy"
                }, (path) => {
                    if (path) {
                        content.first().switchMap(cont => this.fs.createFile(path, cont).catch(() => {
                            return this.fs.getContentSavingFunction(path)(cont);
                        })).subscribe(() => {},
                            error => dialog.showErrorBox("Error", "An unknown error has occurred!"));
                    }
                });
            }
        });

        items.push(newFile);

        return items;
    }
}
