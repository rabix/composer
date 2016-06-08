import {
    Component,
    ApplicationRef,
    Injectable,
    ComponentResolver,
    ViewContainerRef,
    ComponentFactory, Injector, Input} from '@angular/core';
import { PromiseWrapper } from '@angular/common/src/facade/async';
import {
    DynamicallyCompiledComponentDirective,
    ModalFunctionsInterface
} from "../../directives/dynamically-compiled-component.directive";
import {NewFileModalComponent} from "../common/new-file-modal.component";
require('./modal.component.scss');

@Injectable()
export class ModalComponent {
    functions: ModalFunctionsInterface;
    factory: any;
    injector: Injector;
    data: any;

    constructor(private app:ApplicationRef,
                private resolver: ComponentResolver) { }

    toComponent() {
        let factory = this.factory;
        let data = this.data;
        let functions = this.functions;
        let injector = this.injector;

        @Component({
            selector: 'container',
            directives: [DynamicallyCompiledComponentDirective, NewFileModalComponent],
            template:`
            <div class="modal-background" (click)="cancel()">
            <div id="modalDiv" class="modal" (click)="$event.stopPropagation()">
                    <div class="modal-dialog" role="document">
                          <template class="tree-node" 
                              [dynamicallyCompiled]="modalFactory" 
                              [model]="modalData" 
                              [modalFunctions]="modalFunctions"
                              [injector]="injector">
                          </template>
                    </div>
            </div>
            </div>
            `
        })
        class Container {
            @Input() public modalFactory: any = factory;
            @Input() public modalData: any = data;
            @Input() public modalFunctions: any = functions;
            @Input() public injector: Injector = injector;
        }

        return Container;
    }

    show(): Promise<any> {
        // Top level hack
        let viewContainerRef:ViewContainerRef = this.app['_rootComponents'][0]['_hostElement'].vcRef;

        // Set up the promise to return.
        let promiseWrapper:any = PromiseWrapper.completer();

        this.resolver
            .resolveComponent(this.toComponent())
            .then((factory: ComponentFactory<any>) => {
                let dynamicComponent = viewContainerRef.createComponent(factory, 0);
                let component = dynamicComponent.instance;

                component.cancel =this.functions.cancel.bind(component);

                // Assign the cref to the newly created modal so it can self-destruct correctly.
                component.cref = dynamicComponent;
                this.data.cref = dynamicComponent;

                // Assign the promise to resolve.
                component.result = promiseWrapper;
                this.data.result = promiseWrapper;
            });

        return promiseWrapper.promise;
    }
}
