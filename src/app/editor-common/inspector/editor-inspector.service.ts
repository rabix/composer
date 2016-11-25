import {Injectable, ViewContainerRef} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class EditorInspectorService {

    /** Holds whether the inspector should be open or not */
    public status = new BehaviorSubject(false);

    private hostView: ViewContainerRef;

    private inspectedObject: any;

    public show(origin) {
        this.status.next(true);
        this.inspectedObject = origin;
    }

    public hide() {
        this.status.next(false);
    }

    public setHostView(view: ViewContainerRef) {
        this.hostView = view;
    }

    public getHostView() {
        return this.hostView;
    }

    public isInspecting(obj: any) {
        return this.inspectedObject !== undefined && this.inspectedObject === obj;
    }


}