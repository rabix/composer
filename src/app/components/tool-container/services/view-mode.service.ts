import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ViewModeService {

    /** The input ports stream we expose */
    public viewMode: Observable<string>;

    private updateViewMode: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

    constructor() {
        this.viewMode = this.updateViewMode
            .publishReplay(1)
            .refCount();
    }

    public setViewMode(viewMode: string): void {
        this.updateViewMode.next(viewMode);
    }
}
