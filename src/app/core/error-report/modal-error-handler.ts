import {Injectable} from "@angular/core";
import {ModalService} from "../../ui/modal/modal.service";
import {ErrorReportComponent} from "./error-report.component";
@Injectable()
export class ModalErrorHandler {

    constructor(private modal: ModalService) {

    }

    handleError(error: Error) {

        // const component = this.modal.fromComponent(ErrorReportComponent, {
        //     title: "An error has occured",
        //     backdrop: true,
        //     closeOnEscape: true,
        //     closeOnOutsideClick: true
        // });
        // component.code  = error.toString();
        //
        // component.textarea.nativeElement.value = error.message + "\n\n" + error.stack;
        console.error(error);
    }
}
