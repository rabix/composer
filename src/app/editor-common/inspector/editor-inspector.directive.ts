import {Directive, Input, HostListener, EmbeddedViewRef} from "@angular/core";
import {EditorInspectorComponent} from "./editor-inspector.component";
import {EditorInspectorService} from "./editor-inspector.service";

@Directive({
    selector: "[ct-editor-inspector]",
})
export class EditorInspectorDirective {

    @Input("ct-editor-inspector")
    public content: EditorInspectorComponent;

    private embedded: EmbeddedViewRef<any>;

    constructor(private inspector: EditorInspectorService) {
    }

    @HostListener("click")
    public open() {

        if (this.inspector.isInspecting(this)) {
            return;
        }

        const hostView = this.inspector.getHostView();

        if (this.embedded) {
            this.embedded.destroy();
            this.embedded = undefined;
        }

        hostView.clear();

        this.embedded = hostView.createEmbeddedView(this.content as any, null, 0);
        this.inspector.show(this);
    }

}