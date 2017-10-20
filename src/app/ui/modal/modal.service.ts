import {ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, ViewContainerRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Subject} from "rxjs/Subject";
import {ConfirmComponent} from "./common/confirm.component";
import {PromptComponent} from "./common/prompt.component";
import {ModalOptions} from "./modal-options";
import {ModalComponent} from "./modal.component";
import {ErrorComponent} from "./common/error.component";

@Injectable()
export class ModalService {

    private rootViewContainer: ViewContainerRef;

    private modalComponentsRefStack: ComponentRef<ModalComponent> [] = [];

    private onClose = new Subject();

    constructor(private resolver: ComponentFactoryResolver) {

        this.onClose.subscribe(() => this.cleanComponentRef());
    }

    setViewContainer(view: ViewContainerRef): void {
        this.rootViewContainer = view;
    }

    close() {
        this.onClose.next();
    }

    fromComponent<T>(component: { new (...args: any[]): T; }, title?: string): T;
    fromComponent<T>(component: { new (...args: any[]): T; }, options?: Partial<ModalOptions>);
    fromComponent<T>(component: { new (...args: any[]): T; }, options?: Partial<ModalOptions> | string, instanceProperties?: Partial<T>): T;
    fromComponent<T>(...args: any[]): T {

        let [component, options, instanceProperties] = args;

        if (typeof options === "string") {
            options = {title: options};
        }

        options = {
            backdrop: true,
            closeOnEscape: true,
            closeOnOutsideClick: false,
            title: "",
            ...options
        };

        const modalFactory     = this.resolver.resolveComponentFactory(ModalComponent);
        const componentFactory = this.resolver.resolveComponentFactory(component);

        const modalComponentRef = this.rootViewContainer.createComponent(modalFactory);

        modalComponentRef.instance.configure(options as ModalOptions);

        const componentRef = modalComponentRef.instance.produce(componentFactory);

        this.modalComponentsRefStack.push(modalComponentRef);

        if (typeof instanceProperties === "object") {
            Object.assign(componentRef.instance, instanceProperties);
        }

        return componentRef.instance as T;
    }

    fromTemplate<T>(template: TemplateRef<T>, config?: Partial<ModalOptions>): void {

        config = {
            backdrop: true,
            closeOnEscape: true,
            closeOnOutsideClick: false,
            title: "",
            ...config
        };

        const modalFactory      = this.resolver.resolveComponentFactory(ModalComponent);
        const modalComponentRef = this.rootViewContainer.createComponent(modalFactory);

        modalComponentRef.instance.configure(config as ModalOptions);

        modalComponentRef.instance.embed(template);

        this.modalComponentsRefStack.push(modalComponentRef);
    }

    public wrapPromise<T>(handler: (resolve, reject) => void): Promise<T> {
        const insideClosing = new Promise((resolve, reject) => {
            handler(resolve, reject);
        }) as Promise<T>;

        const outsideClosing = new Promise((resolve, reject) => {
            this.onClose.first().subscribe(reject);
        }) as Promise<T>;

        return Promise.race([insideClosing, outsideClosing]) as Promise<T>;
    }

    private cleanComponentRef() {

        if (this.modalComponentsRefStack.length) {
            this.modalComponentsRefStack.pop().destroy();
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

    error(params: {
        title?: string,
        content?: string,
        confirmationLabel?: string
    }) {
        return this.wrapPromise((resolve) => {
            const component = this.fromComponent(ErrorComponent, {
                title: params.title || "Error"
            });

            Object.assign(component, {
                content: "An error has occurred",
                confirmationLabel: "Ok"
            }, params);

            component.onConfirm = () => {
                resolve(true);
                this.close();
            };
        });
    }

    prompt(params: {
        title?: string,
        content?: string,
        confirmationLabel?: string,
        cancellationLabel ?: string,
        formControl?: FormControl,
        minWidth?: string
    }) {

        return this.wrapPromise((resolve, reject) => {
            const component = this.fromComponent(PromptComponent, {
                title: params.title || "Are you sure?"
            });

            if (params.minWidth) {
                component.minWidth = params.minWidth;
            }

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
