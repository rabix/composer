import {ChangeDetectorRef, Directive, HostBinding, HostListener, Input, TemplateRef} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {EditorInspectorService} from "./editor-inspector.service";

@Directive({
    selector: "[ct-editor-inspector]",
})
export class EditorInspectorDirective extends DirectiveBase {

    @Input("ct-editor-inspector")
    public content: TemplateRef<any>;

    @Input("ct-editor-inspector-target")
    public target: any = this;

    @Input("ct-editor-inspector-readonly")
    public readonly = false;

    @HostBinding("class.ct-inspected")
    private isInspected = false;

    constructor(private inspector: EditorInspectorService,
                cdRef: ChangeDetectorRef) {
        super();

        this.tracked = this.inspector.inspectedObject.map(obj => obj === this.target)
            .subscribe(selected => {
                this.isInspected = selected;

                cdRef.markForCheck();
            });
    }

    @HostListener("click", ["$event"])
    public open(event: any) {
        event.stopPropagation();
        this.inspector.show(this.content, this.target);
    }

    public reopen() {
        this.inspector.show(this.content, this.target, true);
    }
}
