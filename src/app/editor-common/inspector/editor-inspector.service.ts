import {EmbeddedViewRef, Injectable, TemplateRef, ViewContainerRef} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class EditorInspectorService {

    /** Holds the reference to the currently inspected object source, can be anything comparable */
    readonly inspectedObject = new BehaviorSubject<any>(undefined);

    private hostView: ViewContainerRef;

    private embeddedView: EmbeddedViewRef<any>;


    hide() {
        this.clearView();
        this.inspectedObject.next(undefined);

    }

    setHostView(view: ViewContainerRef) {
        this.hostView = view;
    }

    isInspecting(obj: any) {
        return obj === this.inspectedObject.getValue();
    }

    inspect(obj: any) {
        this.inspectedObject.next(obj);
    }

    show(template: TemplateRef<any>, inspectedObject?) {

        if (inspectedObject === this.inspectedObject.getValue()) {
            return;
        }

        this.clearView();
        this.embeddedView = this.hostView.createEmbeddedView(template);
        this.inspectedObject.next(inspectedObject);
    }

    private clearView() {

        if (this.embeddedView) {
            this.embeddedView.destroy();
            this.embeddedView = undefined;
        }


        try {
            this.hostView.clear();

        } catch (ex) {
            throw new Error("Trying to clear an invalid host view. " +
                "You need to set the host view of the inspector using the “setHostView” method. " +
                "Original Error: " + ex);

        }
    }

}
