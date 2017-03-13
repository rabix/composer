import {Injectable} from "@angular/core";
import {PublicAppService} from "./public-app.service";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {MenuItem} from "../../ui/menu/menu-item";

const {app, dialog} = window["require"]("electron").remote;

@Injectable()
export class ElectronPublicAppService extends PublicAppService {

    constructor(private fs: LocalDataSourceService) {
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
                        })).subscribe(() => {
                            },
                            error => dialog.showErrorBox("Error", "An unknown error has occurred!"));
                    }
                });
            }
        });

        items.push(newFile);

        return items;
    }

}
