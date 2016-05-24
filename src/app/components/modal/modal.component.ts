import { Component, ComponentRef, ApplicationRef, Injectable,
    ComponentResolver, ViewChild, ViewContainerRef, OnInit, ComponentFactory} from '@angular/core';

import { NgStyle, FORM_DIRECTIVES } from '@angular/common';
import { PromiseWrapper } from '@angular/common/src/facade/async';

import { DynamicDataInterface, CustomComponentBuilder } from '../../builders/component/custom-component.builder';

/**
 * Usage: https://github.com/czeckd/angular2-simple-modal
 * */
export enum ModalType {
    Default,
    Info,
    Warning,
    Critical
}

@Injectable()
export class ModalComponent {
    confirm: any;
    cancel: any;
    title:string = '';
    dynamicTemplateString:string = '';
    type:ModalType = ModalType.Default;
    blocking:boolean = true;
    data: any;
    width:number = 250;
    height:number = 150;

    template:string = `	
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
		`;

    constructor(private app:ApplicationRef,
                private resolver: ComponentResolver
    ) { }

    toComponent() : Function {
        let confirm = this.confirm;
        let cancel = this.cancel;

        let title:string = this.title;
        let dynamicTemplateString:string = this.dynamicTemplateString;
        let width:string = this.width + 'px';
        let height:string = this.height + 'px';
        let icon:string = null;
        let data:any = this.data;
        let template:string;

        if (this.blocking) {
            template = `<div class="modal-background">` +
                `<div class="modal" [ngStyle]="{'width':'` + width + `', 'height':'` + height + `'}">` +
                this.template + `</div></div>`;
        } else {
            template = `<div class="modal-background" (click)="cancel()">
                <div id="modalDiv" class="modal" (click)="$event.stopPropagation()" [ngStyle]="{'width':'` + width + `', 'height':'` + height + `'}">` +
                this.template + `</div></div>`;
        }

        switch (this.type) {
            case ModalType.Info:
                icon = 'images/info-circle.svg';
                break;
            case ModalType.Warning:
                icon = 'images/warning.svg';
                break;
            case ModalType.Critical:
                icon = 'images/exclamation-circle.svg';
                break;
            default:
                break;
        }

        // Note: Do NOT use styleUrls, because they'll keep getting added to the DOM.
        @Component({
            selector: 'modal',
            directives: [ NgStyle ],
            template: template,
            providers: [CustomComponentBuilder]
        })
        class Modal implements OnInit {

            public entity: { description: string };
            // reference for a <div> with #
            @ViewChild('dynamicContentPlaceHolder', {read: ViewContainerRef})
            protected dynamicComponentTarget: ViewContainerRef;

            // ng loader and our custom builder
            constructor(
                protected componentResolver: ComponentResolver,
                protected customComponentBuilder: CustomComponentBuilder
            ){}

            public ngOnInit() {
                // dynamic template built
                var template = dynamicTemplateString;

                // now we get built component, just to load it
                var dynamicComponent = this.customComponentBuilder
                    .CreateComponent(template, FORM_DIRECTIVES.concat(data.directives || []));

                // we have a component and its target
                this.componentResolver
                    .resolveComponent(dynamicComponent)
                    .then((factory: ComponentFactory<DynamicDataInterface>) => {
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

            /* tslint:disable:no-unused-variable */
            private title:string = title;
            private dynamicTemplateString:string = dynamicTemplateString;
            private icon:string = icon;
            /* tslint:enable:no-unused-variable */
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
