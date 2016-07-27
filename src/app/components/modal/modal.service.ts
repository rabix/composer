import {Injectable, ComponentResolver, ViewContainerRef, ComponentRef} from "@angular/core";
import {ModalComponent, ModalOptions} from "./modal.component";
import {ConfirmComponent} from "./common/confirm.component";
import {Subject} from "rxjs";
@Injectable()
export class ModalService {

    private anchor: ViewContainerRef;
    private modalComponentRef: ComponentRef<ModalComponent>;
    private isOpen: boolean;
    private onClose: Subject<any>;

    constructor(private resolver: ComponentResolver) {
        this.isOpen  = false;
        this.onClose = new Subject<any>();

        this.onClose.filter(_ => this.isOpen).subscribe(_ => this.closeAndClean());
    }

    public setAnchor(anchor: ViewContainerRef) {
        this.anchor = anchor;
    }

    public show<T>(component: Function, options?: ModalOptions<T>): Promise<ComponentRef<T>> {

        this.close();
        this.isOpen = true;

        return new Promise((resolve, reject) => {
            this.resolver.resolveComponent(ModalComponent).then(modalFactory => {
                this.modalComponentRef  = this.anchor.createComponent(modalFactory);
                const componentInstance = this.modalComponentRef.instance;

                componentInstance.configure<T>(options || {});
                return this.resolver.resolveComponent(component).then(componentFactory => {
                    const ref = componentInstance.produce<T>(componentFactory, options.componentState || {});
                    resolve(ref);
                }, reject);
            }, reject);
        });

    }

    /**
     * Shows a confirmation modal window.
     *
     * @returns {Promise} Promise that will resolve if user confirms the prompt and reject if user cancels
     */
    public confirm(params: {
        title?: string
        content: string,
        confirmationLabel?: string,
        cancellationLabel?: string
    }): Promise<any> {

        const insideClosings = new Promise((resolve, reject) => {
            this.show<ConfirmComponent>(ConfirmComponent, {title: params.title, componentState: params})
                .then(componentRef => {
                    const cmp = componentRef.instance;

                    cmp.confirm.first().subscribe(_ => {
                        resolve(true);
                        this.close();
                    });
                    cmp.cancel.first().subscribe(_ => {
                        reject();
                        this.close();
                    });
                });
        });

        const outsideClosings = new Promise((resolve, reject) => {
            this.onClose.first().subscribe(reject);
        });

        return Promise.race([insideClosings, outsideClosings]);
    }

    public close() {
        this.onClose.next(true);
    }

    private closeAndClean() {
        this.modalComponentRef.destroy();
        this.isOpen = false;
    }
}
