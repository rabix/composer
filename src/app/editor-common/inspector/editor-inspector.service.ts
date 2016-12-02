import {Injectable, ViewContainerRef} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class EditorInspectorService {

    /** Holds the reference to the currently inspected object source, can be anything comparable */
    public readonly inspectedObject = new BehaviorSubject<any>(undefined);

    private hostView: ViewContainerRef;


    public show(origin) {
        this.inspectedObject.next(origin);
    }

    public hide() {
        this.inspectedObject.next(undefined);
    }

    public setHostView(view: ViewContainerRef) {
        this.hostView = view;
    }

    public getHostView() {
        return this.hostView;
    }

    public isInspecting(obj: any) {
        return obj === this.inspectedObject.getValue();
    }


}