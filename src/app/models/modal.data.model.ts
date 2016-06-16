import {ComponentRef} from '@angular/core';

export interface ModalFunctionsInterface {
    cancel:Function,
    confirm:Function,
}

export class ModalData {
    functions: ModalFunctionsInterface;
    cref:ComponentRef<any>;
    result:any;

    constructor(attrs: {
        functions: ModalFunctionsInterface;
        cref?: ComponentRef<any>;
        result?: any;
    }) {
        this.functions = attrs.functions;
        this.cref = attrs.cref;
        this.result = attrs.result;
    }
}
