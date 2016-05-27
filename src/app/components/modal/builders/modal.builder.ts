import {Component, OnInit, ViewContainerRef, ViewChild, ComponentResolver, ComponentFactory, ComponentRef, Injectable} from "@angular/core";
import {InjectableModalInterface} from '../interfaces/injectable-modal.interface.ts';

export interface DynamicDataInterface {
    data?: any;
    confirm: any;
    cancel: any;
}

export interface ModalFunctionsInterface {
    cancel:Function,
    confirm:Function
}

@Injectable()
export class ModalBuilder {

    public CreateComponent(injectableModal: InjectableModalInterface,
                           modalFunctions: ModalFunctionsInterface,
                           injectDirectives: any[]): any {

        @Component({
            selector: injectableModal.selector,
            template: injectableModal.containerTemplate,
            directives: injectDirectives
        })

        class CustomDynamicComponentModal implements OnInit, DynamicDataInterface {
            public data:any;
            public confirm:Function;
            public cancel:Function;

            // reference for a <div> with #
            @ViewChild(injectableModal.viewContainerRefName, {read: ViewContainerRef})
            private dynamicComponentTarget:ViewContainerRef;

            // ng loader and our custom builder
            constructor(private componentResolver:ComponentResolver) { }

            /* Add other types of modals here */
            public ngOnInit() {
                this.injectComponent();
            }

            injectComponent() {
                return this.componentResolver.resolveComponent(injectableModal.modalComponent)
                    .then((factory:ComponentFactory<DynamicDataInterface>) => {
                        // Instantiates a single {@link Component} and inserts its Host View
                        // into this container at the specified `index`

                        let dynamicComponent = this.dynamicComponentTarget.createComponent(factory);

                        // and here we have access to our dynamic component
                        let component:DynamicDataInterface = dynamicComponent.instance;
                        component.data = injectableModal.data;
                        component.confirm = modalFunctions.confirm.bind(this);
                        component.cancel = modalFunctions.cancel.bind(this);
                    });
            }

            cref:ComponentRef<CustomDynamicComponentModal> = null;
            /* This is needed to close the modal when we click on the background */
            cancel = modalFunctions.cancel.bind(this);
            result:any;
        }
        
        return CustomDynamicComponentModal;
    }
}
