import {ComponentRef} from '@angular/core';

export interface ModalFunctionsInterface {
    cancel: Function,
    confirm: Function,
}

export class ModalData {
    functions: ModalFunctionsInterface;
    cref: ComponentRef<any>;
    model: any;
    result: any;

    constructor(attrs: {
        functions: ModalFunctionsInterface;
        cref?: ComponentRef<any>;
        result?: any;
        model?: any;
    }) {
        this.functions = attrs.functions;
        this.cref      = attrs.cref;
        this.result    = attrs.result;
        this.model     = attrs.model;
    }
}
