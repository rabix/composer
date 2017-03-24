import {ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef} from "@angular/core";
import {Subject} from "rxjs";
import {CheckboxPromptComponent} from "./common/checkbox-prompt.component";
import {OldConfirmComponent} from "./common/confirm.component";
import {ModalComponent, ModalOptions} from "./modal.component";
import {PromptComponent} from "./common/prompt.component";
import {ConfirmationParams, PromptParams} from "./types";

@Injectable()
export class ModalService {

    /**
     * This needs to be hack-set from a component that has the view ref.
     * Still not gracefully solved with Angular.
     * {@link MainComponent.constructor}
     */
    public rootViewRef: ViewContainerRef;

    private modalComponentRef: ComponentRef<ModalComponent>;

    private onClose = new Subject<any>();

    constructor(private resolver: ComponentFactoryResolver) {

        this.onClose.subscribe(_ => {
            this.cleanComponentRef();
        });
    }

    /**
     * Open a modal window with the given component inside it.
     */
    public show<T>(component: { new(...args: any[]): T; }, options?: ModalOptions): T {

        const config = Object.assign({
            backdrop: false,
            closeOnEscape: true,
            closeOnOutsideClick: true,
            componentState: {},
            title: "",
        } as ModalOptions, options);

        // If some other modal is open, close it
        this.close();

        const modalFactory = this.resolver.resolveComponentFactory(ModalComponent);
        const componentFactory = this.resolver.resolveComponentFactory(component);

        this.modalComponentRef = this.rootViewRef.createComponent(modalFactory);
        this.modalComponentRef.instance.configure<T>(config);

        const componentRef = this.modalComponentRef.instance.produce<T>(componentFactory, config.componentState || {});

        return componentRef.instance;
    }

    /**
     * Shows a confirmation modal window.
     *
     * @returns {Promise} Promise that will resolve if user confirms the prompt and reject if user cancels
     */
    public confirm(params: ConfirmationParams): Promise<any> {
        const parameters = Object.assign({
            title: "Confirm",
            content: "Are you sure?",
            confirmationLabel: "Yes",
            cancellationLabel: "Cancel"
        }, params);

        return this.wrap<true>((resolve, reject) => {

            // Show the ConfirmComponent as a modal
            const ref = this.show<OldConfirmComponent>(OldConfirmComponent, {title: parameters.title});

            // Assign passed parameters to it
            Object.assign(ref, parameters);

            // Close the modal when any action is triggered on its output
            ref.decision.subscribe(accepted => {
                accepted ? resolve(true) : reject();
                this.close();
            });
        });
    }

    /**
     * Prompts the user to enter a single string value
     */
    public prompt(params: PromptParams): Promise<string> {

        // Set the default values for params that are not given
        const parameters = Object.assign({
            title: "",
            content: "Please enter the value:",
            confirmationLabel: "Submit",
            cancellationLabel: "Cancel",
            formControl: null
        } as PromptParams, params);

        // Handle actions inside the modal that might result in it closing - submission and cancelling
        return this.wrap<string>((resolve, reject) => {

            // Show the PromptComponent in the modal
            const ref = this.show<PromptComponent>(PromptComponent, {title: parameters.title});

            // Pass given parameters to the PromptComponent instance
            Object.assign(ref, parameters);

            // Watch for the closing action of the component
            ref.decision.subscribe(content => {
                content !== false ? resolve(content) : reject();
                this.close();
            });
        });
    }

    public checkboxPrompt(params = {
                              title: "Confirm",
                              content: "Are you sure?",
                              confirmationLabel: "Yes",
                              cancellationLabel: "Cancel",
                              checkboxLabel: "Don't show this again"
                          }) {
        return this.wrap<boolean>((resolve, reject) => {
            const ref = this.show<CheckboxPromptComponent>(CheckboxPromptComponent, {title: params.title});
            Object.assign(ref, params);

            ref.decision.subscribe(content => {
                content !== null ? resolve(content) : reject();
                this.close();
            });

        });
    }

    /**
     * Close the modal in case one is open.
     */
    public close() {
        this.onClose.next(true);
    }

    /**
     * Cleans up the reference to the underlying componentRef
     */
    private cleanComponentRef() {
        if (this.modalComponentRef) {
            this.modalComponentRef.destroy();
        }
    }

    /**
     * Wraps up the concrete modal component's business logic as a promise
     */
    private wrap<T>(handler: (resolve, reject) => void): Promise<T> {

        // Wrap up the original component business logic handler
        const insideClosings = new Promise((resolve, reject) => {
            handler(resolve, reject);
        });

        // Handle closing the modal from outside (esc key, click on backdrop)
        const outsideClosings = new Promise((resolve, reject) => {
            this.onClose.first().subscribe(reject);
        });

        // Whichever closing action happens (resolves/rejects) first, use that one, and discard the other.
        return Promise.race([insideClosings, outsideClosings]);
    }
}
