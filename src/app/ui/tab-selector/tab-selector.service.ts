import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";

export class TabSelectorService {

    selectedTab = new ReplaySubject<any>(undefined);

    tabClick = new Subject<string>();
}
