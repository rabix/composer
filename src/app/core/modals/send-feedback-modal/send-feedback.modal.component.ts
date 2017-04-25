import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {FormControl, Validators} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-send-feedback-modal",
    styleUrls: ["./send-feedback.modal.component.scss"],
    template: `
        <div class="body">

            <div class="dialog-content">

                <div class="feedback-prompt">
                    What would you like to send?
                </div>

                <!--Feedback type-->
                <div class="feedback-type">

                    <!--Idea-->
                    <div class="feedback clickable" [class.active]="feedbackType === 'idea'"
                         (click)="selectFeedbackType('idea')">

                        <!--Caption-->
                        <div class="caption">
                            <i class="fa fa-lightbulb-o"></i>
                            <!--Caption text-->
                            <div class="caption-text"><strong>Idea</strong></div>
                        </div>

                        <div class="text-muted">Improvements...</div>
                    </div>

                    <!--Problem-->
                    <div class="feedback clickable" [class.active]="feedbackType === 'problem'"
                         (click)="selectFeedbackType('problem')">

                        <!--Caption-->
                        <div class="caption">
                            <i class="fa fa-bug"></i>
                            <!--Caption text-->
                            <div class="caption-text"><strong>Problem</strong></div>
                        </div>


                        <div class="text-muted">Bugs, crashes...</div>
                    </div>

                    <!--Thought-->
                    <div class="feedback clickable" [class.active]="feedbackType === 'thought'"
                         (click)="selectFeedbackType('thought')">

                        <!--Caption-->
                        <div class="caption">
                            <i class="fa fa-comment"></i>
                            <!--Caption text-->
                            <div class="caption-text"><strong>Thought</strong></div>
                        </div>


                        <div class="text-muted">Questions, etc.</div>
                    </div>

                </div>


                <!--Idea feedback description-->
                <div *ngIf="feedbackType === 'idea'" class="description">
                    Please let us know:
                    <ul class="ml-2">
                        <li>
                            Which feature would you like
                        </li>
                        <li>
                            Why is it important for you
                        </li>
                        <li>
                            The problem it would solve
                        </li>
                    </ul>
                </div>

                <!--Problem feedback description-->
                <div *ngIf="feedbackType === 'problem'" class="description">
                    In order to understand the problem, please tell us:
                    <ul class="ml-2">
                        <li>
                            What happened
                        </li>
                        <li>
                            What you were trying to do
                        </li>
                        <li>
                            What you expected to see instead
                        </li>
                    </ul>
                </div>

                <!--Thought feedback description-->
                <div *ngIf="feedbackType === 'thought'" class="description">
                    Questions, comments, praise, criticism and everything in between.
                </div>

                <!--Feedback text-area-->
                <div class="form-group">
                    <textarea [formControl]="feedbackTextControl" class="form-control" rows="6">                    
                    </textarea>
                </div>
            </div>


            <!--Footer-->
            <div class="footer pr-1 pb-1">
                <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
                
                <button type="button" class="btn btn-primary" [disabled]="!feedbackTextControl.valid"
                        (click)="onSendFeedback()">Send
                </button>
            </div>

        </div>


    `
})
export class SendFeedbackModalComponent {

    public feedbackType: "idea" | "problem" | "thought" = "idea";

    public feedbackTextControl = new FormControl("", Validators.required);

    @Input()
    public sendFeedback: (feedbackType: string, feedbackText: string) => void;

    constructor(private modal: ModalService) {
    }

    selectFeedbackType(type: "idea" | "problem" | "thought") {
        this.feedbackType = type;
    }

    public onSendFeedback() {
        this.sendFeedback(this.feedbackType, this.feedbackTextControl.value);
    }

    public onCancel() {
        this.modal.close();
    }

    public closeModal() {
        this.modal.close();
    }
}
