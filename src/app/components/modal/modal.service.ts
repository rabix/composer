import {Injectable, ComponentResolver, ViewContainerRef, ComponentRef} from "@angular/core";
import {ModalComponent, ModalOptions} from "./modal.component";

@Injectable()
export class ModalService {

    private anchor: ViewContainerRef;
    private modalComponentRef: ComponentRef<ModalComponent>;
    private isOpen: boolean;

    constructor(private resolver: ComponentResolver) {
        this.isOpen = false;
    }

    public setAnchor(anchor: ViewContainerRef) {
        this.anchor = anchor;
    }

    public show(component: Function, options?: ModalOptions) {
        if (this.isOpen) {
            this.close();
        }

        this.isOpen = true;
        this.resolver.resolveComponent(ModalComponent)
            .then(modalFactory => {

                this.modalComponentRef  = this.anchor.createComponent(modalFactory);
                const componentInstance = this.modalComponentRef.instance;

                componentInstance.configure(options || {});
                this.resolver.resolveComponent(component).then(componentFactory => {
                    componentInstance.produce(componentFactory);
                });

            });
    }

    public close() {
        this.modalComponentRef.destroy();
        this.isOpen = false;
    }
}
