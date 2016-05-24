import {Component, Input, Injector, Host, forwardRef, Inject} from "@angular/core";
import {TreeNodeComponent} from "./structure/tree-node.component";
import "./tree-view.component.scss";
import {AsyncSocketProviderService} from "../file-tree/async-socket-provider.service";
import {AsyncPipe} from "@angular/common";
import {DynamicallyCompiledComponentDirective} from "../../directives/dynamically-compiled-component.directive";

@Component({
    selector: "tree-view",
    template: `
        <template ngFor let-componentData [ngForOf]="dynamicComponents | async">
            
            <!--This <div class="tree-node"> exists as a CSS specificity convenience-->
            <div class="tree-node">
                <template class="tree-node" 
                          [dynamicallyCompiled]="componentData.factory" 
                          [injector]="injector"
                          [model]="componentData.data">
                </template>   
            </div>
            
        </template>
    `,
    directives: [TreeViewComponent, TreeNodeComponent, DynamicallyCompiledComponentDirective],
    pipes: [AsyncPipe]
})
export class TreeViewComponent {

    @Input() dataProvider;
    @Input() injector: Injector;


    private isExpanded = false;
    private dynamicComponents;


    toggleExpansion(expanded) {
        this.isExpanded = expanded;
    }

    ngOnInit() {
        this.dynamicComponents = this.dataProvider();
    }
}
