import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from "@angular/core";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models";
import {Subscription} from "rxjs/Subscription";
import {ModalService} from "../../../../ui/modal/modal.service";
import {ErrorCode} from "cwlts/models/helpers/validation/ErrorCode";
import {SBDraft2CommandLineToolModel, SBDraft2ExpressionModel} from "cwlts/models/d2sb";

@Component({
    selector: "ct-base-command-list",
    template: `
        <form [formGroup]="form">
            <ct-blank-state *ngIf="!readonly && !baseCommand.length"
                            [buttonText]="'Add base command'"
                            [learnMoreURL]="'http://docs.rabix.io/the-tool-editor#base-command'"
                            [description]="blankStateDescription"
                            (buttonClick)="addBaseCommand()">
            </ct-blank-state>

            <div *ngIf="readonly && !baseCommand.length" class="text-xs-center">
                This tool doesn't specify any baseCommands
            </div>

            <ol *ngIf="baseCommand.length > 0" class="list-unstyled">

                <li *ngFor="let control of form.get('list').controls; let i = index"
                    class="removable-form-control">

                    <ct-expression-input
                            [context]="context"
                            [formControl]="control"
                            [readonly]="readonly">
                    </ct-expression-input>

                    <div *ngIf="!readonly" class="remove-icon">
                        <i [ct-tooltip]="'Delete'"
                           class="fa fa-trash clickable"
                           (click)="removeBaseCommand(i)"></i>
                    </div>
                </li>
            </ol>

            <button type="button" *ngIf="baseCommand.length > 0 && !readonly"
                    class="btn btn-link add-btn-link no-underline-hover"
                    (click)="addBaseCommand()">
                <i class="fa fa-plus"></i> Add base command
            </button>
        </form>
    `,
    styleUrls: ["./base-command-list.component.scss"]
})
export class BaseCommandListComponent implements OnInit, OnChanges, OnDestroy {

    form = new FormGroup({list: new FormArray([])});

    @Input()
    baseCommand: SBDraft2ExpressionModel[] = [];

    @Input()
    model: SBDraft2CommandLineToolModel;

    @Input()
    readonly = false;

    @Input()
    context: any = {};

    @Output()
    update = new EventEmitter<ExpressionModel[]>();

    blankStateDescription = `The part of the command that comes before any tool parameters or options. You can also
                include parameters or options
                that you want to be fixed for every execution of the tool (provided they can be placed
                before any variable
                parameters and options in the command line), or these can be set as arguments below.`;

    private subscription: Subscription;

    constructor(private modal: ModalService) {
    }

    ngOnInit() {
        this.updateFormArray();
    }

    ngOnChanges() {
        if (this.baseCommand) {
            this.updateFormArray();
        }
    }

    public removeBaseCommand(i: number) {
        this.modal.delete("base command").then(() => {
            // reset the expression's validity
            this.baseCommand[i].clearIssue(ErrorCode.EXPR_ALL);
            (this.form.get("list") as FormArray).removeAt(i);
        }, err => {
            console.warn(err);
        });
    }

    public addBaseCommand() {
        const cmd = this.model.addBaseCommand();
        (this.form.get("list") as FormArray).push(new FormControl(cmd));
    }

    private updateFormArray() {
        // cancel previous subscription so recreation of form doesn't trigger an update
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        const formList = [];

        // create formControls from each baseCommand
        for (let i = 0; i < this.baseCommand.length; i++) {
            formList.push(new FormControl(this.baseCommand[i]));
        }

        this.form.setControl("list", new FormArray(formList));

        // re-subscribe update output to form changes
        this.subscription = this.form.valueChanges.map(form => (form.list || [])).subscribe((list) => {
            this.model.updateBaseCommand(list);
            this.update.emit(list);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
