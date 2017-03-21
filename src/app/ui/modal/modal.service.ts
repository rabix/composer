import {ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, ViewContainerRef} from "@angular/core";
import {ModalOptions} from "./modal-options";
import {Subject} from "rxjs";
import {ModalComponent} from "./modal.component";
import {ConfirmComponent} from "../modal-old/common/confirm.component";
import {PromptComponent} from "../modal-old/common/prompt.component";
import {FormControl} from "@angular/forms";

@Injectable()
export class ModalService {

    private rootViewContainer: ViewContainerRef;

    private modalComponentRef: ComponentRef<ModalComponent>;

    private onClose = new Subject();

    constructor(private resolver: ComponentFactoryResolver) {

        this.onClose.subscribe(() => this.cleanComponentRef());
    }

    public setViewContainer(view: ViewContainerRef): void {
        this.rootViewContainer = view;
    }

    public close() {
        this.onClose.next();
    }

    public fromComponent<T>(component: { new (...args: any[]): T; }, config?: Partial<ModalOptions>): T {

        this.close();

        config = {
            backdrop: false,
            closeOnEscape: true,
            closeOnOutsideClick: true,
            title: "",
            ...config
        };

        const modalFactory     = this.resolver.resolveComponentFactory(ModalComponent);
        const componentFactory = this.resolver.resolveComponentFactory(component);

        this.modalComponentRef = this.rootViewContainer.createComponent(modalFactory);

        this.modalComponentRef.instance.configure(config as ModalOptions);

        const componentRef = this.modalComponentRef.instance.produce(componentFactory);

        return componentRef.instance;
    }

    public fromTemplate<T>(template: TemplateRef<T>, config?: Partial<ModalOptions>): void {
        this.close();
        config = {
            backdrop: false,
            closeOnEscape: true,
            closeOnOutsideClick: true,
            title: "",
            ...config
        };

        const modalFactory     = this.resolver.resolveComponentFactory(ModalComponent);
        this.modalComponentRef = this.rootViewContainer.createComponent(modalFactory);

        this.modalComponentRef.instance.configure(config as ModalOptions);

        this.modalComponentRef.instance.embed(template);
    }

    private wrapPromise<T>(handler: (resolve, reject) => void): Promise<T> {
        const insideClosing = new Promise((resolve, reject) => {
            handler(resolve, reject);
        });

        const outsideClosing = new Promise((resolve, reject) => {
            this.onClose.first().subscribe(reject);
        });

        return Promise.race([insideClosing, outsideClosing]);
    }

    private cleanComponentRef() {

        if (this.modalComponentRef) {
            this.modalComponentRef.destroy();
        }

    }

    confirm(params: {
                title?: string,
                content?: string,
                confirmationLabel?: string,
                cancellationLabel ?: string
            }) {

        return this.wrapPromise((resolve, reject) => {
            const component = this.fromComponent(ConfirmComponent, {
                title: params.title || "Are you sure?"
            });

            Object.assign(component, {
                content: "Are you sure?",
                confirmationLabel: "Yes",
                cancellationLabel: "Cancel"
            }, params);

            component.decision.subscribe(accepted => {
                accepted ? resolve(true) : reject();
                this.close();
            });
        });
    }

    prompt(params: {
               title?: string,
               content?: string,
               confirmationLabel?: string,
               cancellationLabel ?: string,
               formControl: FormControl,
           }) {

        return this.wrapPromise((resolve, reject) => {
            const component = this.fromComponent(PromptComponent, {
                title: params.title || "Are you sure?"
            });

            Object.assign(component, {
                content: "Are you sure?",
                confirmationLabel: "Yes",
                cancellationLabel: "Cancel"
            }, params);

            component.decision.subscribe(accepted => {
                accepted ? resolve(true) : reject();
                this.close();
            });
        });
    }
}
