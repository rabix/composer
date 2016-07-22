import {Chap} from "../../../helpers/chap";
export class BaseFormField<T> {

    value: T;
    controlType: "text" | "number"| "button" | "radio";
    label: string;
    key: string;

    constructor(options: {
        value?: T,
        key?: string,
        label?: string,
        required?: boolean,
        controlType?: string
    } = {}) {

        Chap.applyParams(options, this);

    }
}
