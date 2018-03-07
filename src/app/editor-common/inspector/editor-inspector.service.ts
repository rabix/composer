import {EmbeddedViewRef, Injectable, TemplateRef, ViewContainerRef} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class EditorInspectorService {

    /** Holds the reference to the currently inspected object source, can be anything comparable */
    readonly inspectedObject = new BehaviorSubject<any>(undefined);

    private hostView: ViewContainerRef;

    private embeddedView: EmbeddedViewRef<any>;
    private openTemplate: TemplateRef<any>;


    hide() {
        this.clearView();
        this.inspectedObject.next(undefined);

    }

    reload(): void {
        if (this.openTemplate) {
            this.show(this.openTemplate, this.inspectedObject.getValue(), true);
        }
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

    show(template: TemplateRef<any>, inspectedObject?, forceReopen = false) {

        if (inspectedObject === this.inspectedObject.getValue() && !forceReopen) {
            return;
        }


        this.clearView();
        this.openTemplate = template;
        this.embeddedView = this.hostView.createEmbeddedView(template);
        this.inspectedObject.next(inspectedObject);
    }

    private clearView() {

        if (this.embeddedView) {
            this.embeddedView.destroy();
            this.embeddedView = undefined;
        }

        this.openTemplate = undefined;


        try {
            this.hostView.clear();

        } catch (ex) {
            throw new Error("Trying to clear an invalid host view. " +
                "You need to set the host view of the inspector using the “setHostView” method. " +
                "Original Error: " + ex);

        }
    }

}
