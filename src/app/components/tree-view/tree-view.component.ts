import {Component, Input, Injector} from "@angular/core";
import {TreeNodeComponent} from "./structure/tree-node.component";
import "./tree-view.component.scss";
import {AsyncSocketProviderService} from "../file-tree/async-socket-provider.service";
import {AsyncPipe} from "@angular/common";
import {DynamicallyCompiledComponentDirective} from "../../directives/dynamically-compiled-component.directive";

@Component({
    selector: "tree-view",
    template: `
            <tree-node [node]="root" (expansionSwitch)="toggleExpansion($event)"></tree-node>
           
           
            <template ngFor let-componentData [ngForOf]="dynamicComponents | async">
                <template [dynamicallyCompiled]="componentData.factory" [model]="componentData.data"></template>   
            </template>
           
            <template [ngIf]="isExpanded">
                <tree-view *ngFor="let node of root.children" [root]="node"></tree-view>
            </template>
    `,
    directives: [TreeViewComponent, TreeNodeComponent, DynamicallyCompiledComponentDirective],
    pipes: [AsyncPipe]
})
export class TreeViewComponent {

    @Input() root;
    @Input() dataProvider: AsyncSocketProviderService;

    private children;
    private items      = [];
    private items;
    private isExpanded = false;

    private dynamicComponents;

    constructor(private injector: Injector) {


    }

    toggleExpansion(expanded) {
        this.isExpanded = expanded;
    }

    ngOnInit() {
        this.dynamicComponents = this.dataProvider.getDirContentComponents();
    }
}
