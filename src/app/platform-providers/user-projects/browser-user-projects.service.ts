import {Injectable} from "@angular/core";
import {MenuItem} from "../../components/menu/menu-item";
import {UserProjectsService} from "./user-projects.service";

@Injectable()
export class BrowserUserProjectsService extends UserProjectsService {

    public getContextMenu(name, content): MenuItem[] {
        return [];
    }

}
