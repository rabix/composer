import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";

export interface PanelStatus {
}

@Injectable()
export class PanelSwitcherService {

    public panelStatus: Observable<PanelStatus[]> = new BehaviorSubject([]);

    private panelChanges = new Subject();

    constructor() {

    }

    public togglePanel(id: string) {
    }


}