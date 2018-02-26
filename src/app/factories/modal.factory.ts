import {ModalOptions} from "../ui/modal/modal-options";
import {ModalService} from "../ui/modal/modal.service";
import {InjectionToken} from "@angular/core";

export const ModalManagerToken = new InjectionToken("app.modalManager");

export interface ModalManager {
    open<T>(component: { new(...args: any[]): T; }, title?: string): T;

    open<T>(component: { new(...args: any[]): T; }, options?: Partial<ModalOptions>);

    open<T>(component: { new(...args: any[]): T; }, options?: Partial<ModalOptions> | string, instanceProperties?: Partial<T>): T;

    close(nestedComponentInstance?: any);
}


export function modalManagerFactory(modalService: ModalService): ModalManager {
    return {
        open(component, options?, instanceProperties?) {
            return modalService.fromComponent(component, options, instanceProperties);
        },
        close(nestedComponentInstance?) {
            modalService.close(nestedComponentInstance);
        }
    }
}
