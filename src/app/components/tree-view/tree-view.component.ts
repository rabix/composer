import {Component, Input, Injector, Output} from "@angular/core";
import {TreeNodeComponent} from "./structure/tree-node.component";
import "./tree-view.component.scss";
import {AsyncPipe} from "@angular/common";
import {DynamicallyCompiledComponentDirective} from "../../directives/dynamically-compiled-component.directive";
import {BehaviorSubject, Observable} from "rxjs/Rx";
import {ComponentFactoryProviderFn} from "./interfaces/tree-data-provider";

@Component({
    selector: "tree-view",
    template: `
        <template ngFor let-componentData [ngForOf]="dynamicComponentStream | async">
            
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

    @Input() dataProvider: ComponentFactoryProviderFn;
    @Input() injector: Injector;

    @Output() onDataLoad: BehaviorSubject<any>;


    private isExpanded = false;
    private dynamicComponentStream: Observable<any>;

    constructor() {
        this.onDataLoad = new BehaviorSubject(null);
    }


    toggleExpansion(expanded) {
        this.isExpanded = expanded;
    }

    ngOnInit() {
        this.dynamicComponentStream = this.dataProvider().do((data)=> {
            this.onDataLoad.next(data);
        });
    }
}
