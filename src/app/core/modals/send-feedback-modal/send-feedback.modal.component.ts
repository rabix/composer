import {Component} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {ErrorWrapper} from "../../helpers/error-wrapper";
import {filter} from "rxjs/operators";


@Component({
    selector: "ct-send-feedback-modal",
    styleUrls: ["./send-feedback.modal.component.scss"],
    template: `
        <div class="body" data-test="send-feedback-modal">

            <div class="dialog-content">

                <div class="feedback-prompt">What would you like to send?</div>

                <!--Feedback type-->
                <div class="feedback-type">

                    <!--Idea-->
                    <div data-test="send-feedback-modal-idea-region" class="feedback clickable"
                         [class.active]="form.get('type').value === 'idea'"
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
                    <div data-test="send-feedback-modal-problem-region" class="feedback clickable"
                         [class.active]="form.get('type').value === 'problem'"
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
                    <div data-test="send-feedback-modal-thought-region" class="feedback clickable"
                         [class.active]="form.get('type').value === 'thought'"
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
                <div *ngIf="form.get('type').value === 'idea'" class="description">
                    Please let us know:
                    <ul class="ml-2">
                        <li>Which feature would you like to add?</li>
                        <li>Why is it important for you?</li>
                        <li>The problem it would solve?</li>
                    </ul>
                </div>

                <!--Problem feedback description-->
                <div *ngIf="form.get('type').value === 'problem'" class="description">
                    In order for us to better understand the problem, please tell us:
                    <ul class="ml-2">
                        <li>What happened?</li>
                        <li>What were you trying to do when the problem occured?</li>
                        <li>What did you expect to see instead?</li>
                    </ul>
                </div>

                <!--Thought feedback description-->
                <div *ngIf="form.get('type').value === 'thought'" class="description">
                    Questions, comments, praise, criticism and everything in between.
                </div>

                <!--Feedback text-area-->
                <div class="form-group">
                    <textarea data-test="send-feedback-modal-feedback-text" [formControl]="form.get('text')" class="form-control" rows="6">                    
                    </textarea>
                </div>

                <div *ngIf="errorMessage">
                    <span class="text-danger">
                        <i class="fa fa-times-circle fa-fw"></i>
                            {{errorMessage}}
                    </span>
                </div>
            </div>


            <!--Footer-->
            <div class="footer pr-1 pb-1">
                <button type="button" class="btn btn-secondary" data-test='send-feedback-modal-cancel-button'
                        (click)="closeModal()">Cancel
                </button>

                <button type="button" class="btn btn-primary" data-test='send-feedback-modal-send-button'
                        [disabled]="!form.valid || isSending"
                        (click)="onSendFeedback()">
                    <ct-loader-button-content [isLoading]="isSending">Send</ct-loader-button-content>
                </button>
            </div>

        </div>


    `
})
export class SendFeedbackModalComponent extends DirectiveBase {

    isSending = false;

    form: FormGroup;

    errorMessage?: string;


    constructor(private modal: ModalService,
                private formBuilder: FormBuilder,
                private dataGateway: DataGatewayService,) {

        super();

        this.form = formBuilder.group({
            type: ["idea", [(control: FormControl) => {
                if (["idea", "problem", "thought"].indexOf(control.value) !== -1) {
                    return null;
                }
                return {type: "Type must be “idea”, “problem” or “thought”"};
            }]],
            text: ["", [(ctrl: FormControl) => {
                if (ctrl.value.trim()) return null;

                return {text: "Content must not be empty"}
            }]]
        });

        this.form.valueChanges.pipe(
            filter(() => this.errorMessage !== undefined)
        ).subscribeTracked(this, () => this.errorMessage = undefined);

    }

    selectFeedbackType(type: "idea" | "problem" | "thought") {
        this.form.patchValue({type});
    }

    onSendFeedback() {

        const {type, text} = this.form.getRawValue();
        this.errorMessage  = undefined;

        this.isSending = true;
        this.dataGateway.sendFeedbackToPlatform(type, text).then(() => {
            this.isSending = false;
            this.closeModal();
        }, err => {
            this.isSending    = false;
            this.errorMessage = "Failed to send feedback. " + new ErrorWrapper(err);
        });
    }

    closeModal() {
        this.modal.close();
    }
}
