import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";

export class TabSelectorService {

    selectedTab = new ReplaySubject<any>(1);

    tabClick = new Subject<string>();
}
