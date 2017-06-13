import {ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, ViewContainerRef} from "@angular/core";
import {ModalOptions} from "./modal-options";
import {Subject} from "rxjs/Subject";
import {ModalComponent} from "./modal.component";
import {ConfirmComponent} from "./common/confirm.component";
import {PromptComponent} from "./common/prompt.component";
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
            backdrop: true,
            closeOnEscape: true,
            closeOnOutsideClick: false,
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
            backdrop: true,
            closeOnEscape: true,
            closeOnOutsideClick: false,
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
        }) as Promise<T>;

        const outsideClosing = new Promise((resolve, reject) => {
            this.onClose.first().subscribe(reject);
        }) as Promise<T>;

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

    delete(objectName: string) {
        return this.confirm({
            title: `Delete ${objectName}`,
            content: `Are you sure you want to delete this ${objectName}?`,
            confirmationLabel: "Delete",
            cancellationLabel: "Cancel"
        });
    }

    prompt(params: {
        title?: string,
        content?: string,
        confirmationLabel?: string,
        cancellationLabel ?: string,
        formControl?: FormControl,
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
                // If click on Cancel button or Esc on your keyboard then accepted is false
                accepted === false ? reject() : resolve(true);
                this.close();
            });
        });
    }
}
