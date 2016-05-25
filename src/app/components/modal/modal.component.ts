import { 
    Component, 
    ComponentRef, 
    ApplicationRef,
    Injectable,
    ComponentResolver, 
    ViewChild, 
    ViewContainerRef, 
    OnInit, 
    ComponentFactory} from '@angular/core';
import { NgStyle } from '@angular/common';
import { PromiseWrapper } from '@angular/common/src/facade/async';
import {CustomComponentBuilder, DynamicDataInterface} from '../../builders/component/custom-component.builder';
import {NewFileModalComponent} from './new-file-modal.component'
require('./modal.component.scss');

/**
 * Usage: https://github.com/czeckd/angular2-simple-modal
 * */
export enum ModalType {
    NewFile,
    Select,
    Confirm,
    Warning
}

@Injectable()
export class ModalComponent {
    confirm: any;
    cancel: any;

    functions: any;
    title:string = '';
    type:ModalType;

    data: any;
    width:number = 250;
    height:number = 150;

    constructor(private app:ApplicationRef,
                private resolver: ComponentResolver
    ) { }

    toComponent() : Function {
        let confirm = this.confirm;
        let cancel = this.cancel;

        let type:ModalType = this.type;

        let width:string = this.width + 'px';
        let height:string = this.height + 'px';

        let data:any = this.data;

        let template:string = `
        <div class="modal-background" (click)="cancel()">
        <div id="modalDiv" class="modal" (click)="$event.stopPropagation()" [ngStyle]="{'width':'` + width + `', 'height':'` + height + `'}">
     
                <div class="modal-dialog" role="document">
                <div class="modal-content">
                
                       <div class="modal-header">
                            <h2 *ngIf="title" class="modal-title" [innerHTML]="title"></h2>
                       </div>
                      
                        <div class="modal-body">
                            <div #dynamicContentPlaceHolder></div>
                        </div>
                
                </div>
                </div>
        
        </div>
        </div>
        `;

        // Note: Do NOT use styleUrls, because they'll keep getting added to the DOM.
        @Component({
            selector: 'modal',
            directives: [ NgStyle ],
            template: template,
            providers: [CustomComponentBuilder]
        })
        class Modal implements OnInit {
            
            // reference for a <div> with #
            @ViewChild('dynamicContentPlaceHolder', {read: ViewContainerRef})
            private dynamicComponentTarget: ViewContainerRef;

            // ng loader and our custom builder
            constructor(
                private componentResolver: ComponentResolver
            ){}

            public ngOnInit() {
                switch(type) {
                    case ModalType.NewFile:
                        this.injectComponent(NewFileModalComponent);
                        break;
                }
            }

            injectComponent(component) {
                this.componentResolver.resolveComponent(component).
                then((factory: ComponentFactory<DynamicDataInterface>) => {
                    // Instantiates a single {@link Component} and inserts its Host View
                    // into this container at the specified `index`
                    let dynamicComponent = this.dynamicComponentTarget.createComponent(factory, 0);

                    // and here we have access to our dynamic component
                    let component: DynamicDataInterface = dynamicComponent.instance;
                    component.data = data;
                    component.confirm = confirm.bind(this);
                    component.cancel = cancel.bind(this);
                });
            }

            cref:ComponentRef<Modal> = null;

            /* This is needed to close the modal when we click on the background */
            cancel = cancel.bind(this);
            result:any;
        }
        return Modal;
    }

    show() : Promise<any> {
        // Top level hack
        let viewContainerRef:ViewContainerRef = this.app['_rootComponents'][0]['_hostElement'].vcRef;

        // Set up the promise to return.
        let promiseWrapper:any = PromiseWrapper.completer();

        this.resolver
            .resolveComponent(this.toComponent())
            .then((factory: ComponentFactory<any>) => {
                let dynamicComponent = viewContainerRef.createComponent(factory, 0);
                let component = dynamicComponent.instance;

                // Assign the cref to the newly created modal so it can self-destruct correctly.
                component.cref = dynamicComponent;

                // Assign the promise to resolve.
                component.result = promiseWrapper;
            });

        return promiseWrapper.promise;
    }
}
