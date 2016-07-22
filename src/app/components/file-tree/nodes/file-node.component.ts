import {Component, Input, forwardRef, Inject} from "@angular/core";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";
import {FileTreeService} from "../file-tree.service";
import {FileModel} from "../../../store/models/fs.models";
import {DynamicState} from "../../runtime-compiler/dynamic-state.interface";
import {TreeViewNode} from "../../tree-view/interfaces/tree-view-node";
import {Subscription} from "rxjs/Rx";

@Component({
    selector: "file-tree:file",
    directives: [TreeviewSelectableDirective],
    host: {
        "(dblclick)": "onDoubleClick()"
    },
    template: `
        <div treeview-selectable>
            <span class="expander"></span>
            <span class="fa fa-file-o node-icon"></span>
            
             <span class="name">
                {{ file?.name }}<span *ngIf="file?.isModified">*</span>
            </span>
        </div>
        
    `
})
export class FileNodeComponent implements DynamicState, TreeViewNode {

    public isExpandable = false;

    @Input() file: FileModel;

    private fileWatcher: Subscription;

    constructor(@Inject(forwardRef(() => FileTreeService))
                private fileTreeService: FileTreeService) {
    }

    private onDoubleClick() {
        this.fileTreeService.openFile(this.file);
        if (!this.fileWatcher) {

            this.fileWatcher = this.fileTreeService.watchFile(this.file).subscribe(file => {
                this.file = file;
            });
        }
    }

    public setState(file) {
        this.file = file;
    }

    ngOnDestroy() {
        if (this.fileWatcher) {
            this.fileWatcher.unsubscribe();
        }
    }

}
