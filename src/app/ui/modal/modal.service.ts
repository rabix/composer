import {ComponentFactoryResolver, ComponentRef, Injectable, TemplateRef, ViewContainerRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Subject} from "rxjs/Subject";
import {ConfirmComponent} from "./common/confirm.component";
import {PromptComponent} from "./common/prompt.component";
import {ModalOptions} from "./modal-options";
import {ModalComponent} from "./modal.component";
import {ErrorComponent} from "./common/error.component";
import {filter, take} from "rxjs/operators";

@Injectable()
export class ModalService {

    openModals: ComponentRef<ModalComponent> [] = [];

    private rootViewContainer: ViewContainerRef;

    private onClose = new Subject<any>();

    constructor(private resolver: ComponentFactoryResolver) {

        this.onClose.subscribe(component => {
            this.cleanComponentRef(component);
        });
    }

    setViewContainer(view: ViewContainerRef): void {
        this.rootViewContainer = view;
    }

    close(component?: any) {

        if (component) {
            for (let i = this.openModals.length - 1; i >= 0; i--) {
                const modal = this.openModals[i];
                if (modal.instance.nestedComponentRef.instance === component) {
                    this.onClose.next(modal);
                    return;
                }
            }
        } else {
            this.onClose.next();
        }
    }

    fromComponent<T>(component: { new(...args: any[]): T; }, title?: string): T;
    fromComponent<T>(component: { new(...args: any[]): T; }, options?: Partial<ModalOptions>);
    fromComponent<T>(component: { new(...args: any[]): T; }, options?: Partial<ModalOptions> | string, instanceProperties?: Partial<T>): T;
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

        this.openModals.push(modalComponentRef);

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

        this.openModals.push(modalComponentRef);
    }

    wrapPromise<T>(handler: (resolve, reject) => void): Promise<T> {
        const insideClosing = new Promise((resolve, reject) => {
            handler(resolve, reject);
        }) as Promise<T>;

        const outsideClosing = new Promise((resolve, reject) => {
            this.onClose.pipe(
                filter(c => c === undefined),
                take(1)
            ).subscribe(reject);
        }) as Promise<T>;

        return Promise.race([insideClosing, outsideClosing]) as Promise<T>;
    }

    confirm(params: {
        title?: string,
        content?: string,
        confirmationLabel?: string,
        cancellationLabel?: string
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
        cancellationLabel?: string,
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
                this.close(component);
            });
        });
    }

    private cleanComponentRef(component?) {

        if (!this.openModals.length) {
            return;
        }

        let componentIndex;
        if (component && ~(componentIndex = this.openModals.indexOf(component))) {
            const [componentModal] = this.openModals.splice(componentIndex, 1);
            componentModal.destroy();
            return;
        }

        this.openModals.pop().destroy();

    }
}
