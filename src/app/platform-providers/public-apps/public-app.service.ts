import {Observable} from "rxjs";
import {MenuItem} from "../../ui/menu/menu-item";

export abstract class PublicAppService {
    public abstract getContextMenu(name: string, content: Observable<string>): MenuItem[];
}
