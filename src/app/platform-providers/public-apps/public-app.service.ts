import {Observable} from "rxjs";
import {MenuItem} from "../../components/menu/menu-item";

export abstract class PublicAppService {
    public abstract getContextMenu(name: string, content: Observable): MenuItem[];
}
