import {
    Component,
    ApplicationRef,
    Injectable,
    ComponentResolver,
    ViewContainerRef,
    ComponentFactory, Injector, Input} from '@angular/core';
import { PromiseWrapper } from '@angular/common/src/facade/async';
import {DynamicComponentContext} from "../runtime-compiler/dynamic-component-context";
import {ComponentCompilerDirective} from "../runtime-compiler/component-compiler.directive";
import {ModalData} from "../../models/modal.data.model";
require('./modal.component.scss');

@Injectable()
export class ModalComponent {
    dynamicComponentContext: DynamicComponentContext<any>;
    injector: Injector;

    constructor(private app:ApplicationRef,
                private resolver: ComponentResolver) {
    }

    toComponent() {
        let dynamicComponentContext =this.dynamicComponentContext;
        let injector = this.injector;

        @Component({
            selector: 'container',
            directives: [ComponentCompilerDirective],
            template:`
            <div class="modal-background" (click)="cancel()">
            <div id="modalDiv" class="modal" (click)="$event.stopPropagation()">
                    <div class="modal-dialog" role="document">
                        <template [component-compiler]="dynamicComponentContext">
                        </template>   
                    </div>
            </div>
            </div>
            `
        })
        class Container {
            @Input() public dynamicComponentContext: DynamicComponentContext<any> = dynamicComponentContext;
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
                let dynamicComponent = viewContainerRef.createComponent(factory, 0, this.injector);
                let component = dynamicComponent.instance;
                let componentState = <ModalData>this.dynamicComponentContext.getState();

                component.cancel = componentState.functions.cancel.bind(component);

                // Assign the cref to the newly created modal so it can self-destruct correctly.
                component.cref = dynamicComponent;
                componentState.cref = dynamicComponent;

                // Assign the promise to resolve.
                component.result = promiseWrapper;
                componentState.result = promiseWrapper;
            });

        return promiseWrapper.promise;
    }
}
