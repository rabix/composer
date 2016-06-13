import {Component, Input, Injector, Output} from "@angular/core";
import {TreeNodeComponent} from "./structure/tree-node.component";
import {AsyncPipe, NgFor} from "@angular/common";
import {BehaviorSubject, Observable} from "rxjs/Rx";
import {ComponentFactoryProviderFn} from "./interfaces/tree-data-provider";
import "./tree-view.component.scss";
import {ComponentCompilerDirective} from "../runtime-compiler/component-compiler.directive";
import {DynamicComponentContext} from "../runtime-compiler/dynamic-component-context";
@Component({
    selector: "tree-view",
    template: `
        <!--This <div class="tree-node"> exists as a CSS specificity convenience-->
        <div *ngFor="let context of (componentContexts | async)" 
             class="tree-node" 
             [component-compiler]="context">
        </div>   
    `,
    directives: [TreeViewComponent, TreeNodeComponent, ComponentCompilerDirective, NgFor],
    pipes: [AsyncPipe]
})
export class TreeViewComponent {

    @Input() dataProvider: ComponentFactoryProviderFn;
    @Input() injector: Injector;

    @Output() onDataLoad: BehaviorSubject<any>;


    private isExpanded = false;
    private componentContexts: Observable<DynamicComponentContext<any>[]>;

    constructor() {
        this.onDataLoad = new BehaviorSubject(null);
    }


    toggleExpansion(expanded) {
        this.isExpanded = expanded;
    }

    ngOnInit() {
        this.componentContexts = this.dataProvider().do((data)=> {
            console.log("Data loaded", data);
            this.onDataLoad.next(data);
        });
    }
}
