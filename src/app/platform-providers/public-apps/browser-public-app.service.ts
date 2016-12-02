import {Injectable} from "@angular/core";
import {PublicAppService} from "./public-app.service";
import {MenuItem} from "../../components/menu/menu-item";

@Injectable()
export class BrowserPublicAppService extends PublicAppService {

    public getContextMenu(name, content): MenuItem[] {
        return [];
    }

}
