import {AbstractControl, FormArray} from "@angular/forms";

export function adaptFormArraySize(formArray: FormArray, size: number, elementProducer: (index: number) => AbstractControl) {

    while (formArray.length !== size) {
        if (formArray.length > size) {
            formArray.removeAt(0);
        } else if (formArray.length < size) {
            formArray.push(elementProducer(formArray.length));
        }
    }
}
