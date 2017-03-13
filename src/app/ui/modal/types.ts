import {FormControl} from "@angular/forms";

export interface ModalQuestionParams {
    title?: string;
    content?: string;
    confirmationLabel?: string;
    cancellationLabel?: string;
}

export interface ConfirmationParams extends ModalQuestionParams {

}

export interface PromptParams extends ModalQuestionParams {
    /**
     * Title of the modal window
     */
    title: string;
    /**
     * Title of the input field
     */
    content: string;

    /**
     * Form control that will be used as a question entry
     */
    formControl: FormControl;

}
