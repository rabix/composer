import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tree-node-icon",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <i class="fa fa-fw"
           [class.fa-spin]="isLoading"
           [class.fa-circle-o-notch]="isLoading"

           [class.fa-file]="type === 'file'"

           [class.fa-folder]="type === 'folder'"
           [class.fa-folder-open]="type === 'folder' && expanded"

           [class.fa-angle-right]="type === 'angle' && !expanded"
           [class.fa-angle-down]="type === 'angle' && expanded"


           [class.app-type-icon]="type === 'CommandLineTool' || type === 'Workflow'"

           [class.icon-command-line-tool]="type === 'CommandLineTool'"
           [class.icon-workflow]="type === 'Workflow'"

        ></i>
    `
})
export class TreeNodeIconComponent {

    @Input()
    public expanded = false;

    @Input()
    public type: string;

    @Input()
    public isLoading: boolean;

}
