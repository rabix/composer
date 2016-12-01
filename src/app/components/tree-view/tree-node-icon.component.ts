import {Component, ChangeDetectionStrategy, Input} from "@angular/core";

@Component({
    selector: "ct-tree-node-icon",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <i class="fa fa-fw"
            [class.fa-file]="type === 'file'"
            
            [class.fa-folder]="type === 'folder'"
            [class.fa-folder-open]="type === 'folder' && expanded"
            
            [class.fa-angle-right]="type === 'angle' && !expanded"
            [class.fa-angle-down]="type === 'angle' && expanded"
            
            [class.fa-circle-o-notch]="type === 'loader'"
            [class.fa-spin]="type === 'loader'"
            
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

}