import {Component, Input} from "@angular/core";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";
import {FileTreeService} from "../file-tree.service";
import {FileModel} from "../../../store/models/fs.models";
import {DynamicState} from "../../runtime-compiler/dynamic-state.interface";

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
                {{ model.name }}
            </span>
        </div>
        
    `
})
export class FileNodeComponent implements DynamicState {

    private isExpandable = false;

    @Input() model: FileModel;

    constructor(private fileTreeService: FileTreeService) {
    }

    private onDoubleClick() {
        this.fileTreeService.openFile(this.model);
    }

    public setState(state) {
        this.model = state;
    }

}
