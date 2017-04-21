import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";
import {CredentialsEntry} from "../../../services/storage/user-preferences-types";
import {ErrorBarService} from "../../../layout/error-bar/error-bar.service";
import {PlatformAPIGatewayService} from "../../../auth/api/platform-api-gateway.service";
import {Observable} from "rxjs/Observable";

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
                    <div data-test="idea-region" class="feedback clickable" [class.active]="feedbackType === 'idea'"
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
                    <div data-test="problem-region" class="feedback clickable"
                         [class.active]="feedbackType === 'problem'"
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
                    <div data-test="thought-region" class="feedback clickable"
                         [class.active]="feedbackType === 'thought'"
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
                            Which feature you would like
                        </li>
                        <li>
                            Why it is important for you
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
                    <textarea data-test="feedback-text" [formControl]="feedbackTextControl.controls['sendFeedBack']"
                              class="form-control" rows="6">                    
                    </textarea>
                </div>
            </div>


            <!--Footer-->
            <div class="footer pr-1 pb-1">
                <button type="button" class="btn btn-secondary" data-test='cancel-button'
                        (click)="closeModal()">Cancel
                </button>

                <button type="button" class="btn btn-success" data-test='send-button'
                        [disabled]="!feedbackTextControl.valid"
                        (click)="onSendFeedback()">Send
                </button>
            </div>

        </div>


    `
})
export class SendFeedbackModalComponent {

    public feedbackType: "idea" | "problem" | "thought" = "idea";

    public feedbackTextControl = this.formBuilder.group({
        sendFeedBack: ["", [Validators.required]],
    });

    @Input()
    public feedbackPlatform: CredentialsEntry = null;

    constructor(private modal: ModalService, private formBuilder: FormBuilder, private errorBar: ErrorBarService,
                private apiGateway: PlatformAPIGatewayService) {
    }

    selectFeedbackType(type: "idea" | "problem" | "thought") {
        this.feedbackType = type;
    }

    public onSendFeedback() {

        if (this.feedbackPlatform) {

            const platform = this.apiGateway.forHash(this.feedbackPlatform.hash);

            const call = platform ? platform.sendFeedback(this.feedbackPlatform.user.id, this.feedbackType,
                this.feedbackTextControl.controls["sendFeedBack"].value, this.feedbackPlatform.url)
                : Observable.throw(
                    new Error("Could not connect to the platform and send a feedback message"));

            call.subscribe(() => {
                this.closeModal();
            }, err => {
                console.log("Error", err);
                if (err.status === 0) {
                    this.errorBar.showError("Could not connect to the platform and send a feedback message");
                } else {
                    this.errorBar.showError(err);
                }
            });

        }
    }

    public closeModal() {
        this.modal.close();
    }
}
