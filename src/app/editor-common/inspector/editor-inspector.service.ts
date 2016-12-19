import {Injectable, ViewContainerRef, EmbeddedViewRef, TemplateRef} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class EditorInspectorService {

    /** Holds the reference to the currently inspected object source, can be anything comparable */
    public readonly inspectedObject = new BehaviorSubject<any>(undefined);

    private hostView: ViewContainerRef;

    private embeddedView: EmbeddedViewRef<any>;


    public hide() {
        this.clearView();
        this.inspectedObject.next(undefined);

    }

    public setHostView(view: ViewContainerRef) {
        this.hostView = view;
    }

    public isInspecting(obj: any) {
        return obj === this.inspectedObject.getValue();
    }

    public inspect(obj: any){
        this.inspectedObject.next(obj);
    }

    public show(template: TemplateRef<any>, inspectedObject?) {

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

        this.hostView.clear();
    }

}
