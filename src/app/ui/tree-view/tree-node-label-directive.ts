import {Directive, Input, TemplateRef} from "@angular/core";

@Directive({
    selector: "[ct-tree-node-label-directive]"
})
export class TreeNodeLabelDirective {

    @Input("ct-tree-node-label-directive")
    type: string;

    templateRef: TemplateRef<any>;

    constructor(templateRef: TemplateRef<any>) {
        this.templateRef = templateRef;
    }
}
