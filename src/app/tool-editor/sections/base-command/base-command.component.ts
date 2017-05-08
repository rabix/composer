import {
    Component, EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ExpressionModel, CommandLineToolModel} from "cwlts/models";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {GuidService} from "../../../services/guid.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: "ct-base-command",
    styleUrls: ["./base-command.component.scss"],
    template: `
        <ct-form-panel>
            <div class="tc-header">
                Base Command
            </div>
            <div class="tc-body">
                <form *ngIf="form">

                    <ct-base-command-list></ct-base-command-list>

                    <hr>
                    
                    <div>
                        <div class="text-title mb-1">Streams</div>
                    </div>

                    <ct-streams [stdin]="stdin" 
                                [stdout]="stdout" 
                                [context]="context"
                                [readonly]="readonly"
                                (update)="updateStream.emit($event); log($event)">
                    </ct-streams>
                </form>
            </div>
        </ct-form-panel>
    `
})
export class BaseCommandComponent extends DirectiveBase implements OnInit, OnDestroy, OnChanges {
    /** baseCommand property of model */
    @Input()
    baseCommand: ExpressionModel[];

    /** Stdin property of model */
    @Input()
    stdin: ExpressionModel;

    /** Stdout property of model */
    @Input()
    stdout: ExpressionModel;

    /** The parent forms group which is already in the clt-editor form tree */
    @Input()
    form: FormGroup;

    /** Context in which expression should be evaluated */
    context: { $job: any };

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    /** Update event triggered on command form changes (add, remove, edit) */
    @Output()
    updateCmd = new ReplaySubject<ExpressionModel[]>();

    @Output()
    updateStream = new EventEmitter<ExpressionModel>();

    /** form group for base command */
    baseCommandForm: FormGroup;

    /** List which connects model to forms */
    formList: Array<{ id: string, model: ExpressionModel }> = [];

    constructor(private guidService: GuidService, private modal: ModalService) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (changes["baseCommand"]) {
            this.initCmdForm(changes["baseCommand"].currentValue);
        }

        this.context = this.model.getContext();
    }

    private initCmdForm(cmdList: ExpressionModel[]) {
        this.formList = cmdList.map(model => {
            return {
                id: this.guidService.generate(), model
            };
        });

        this.baseCommandForm = new FormGroup({});

        this.formList.forEach((item) => {
            this.baseCommandForm.addControl(
                item.id,
                new FormControl(item.model, [Validators.required])
            );
        });

        this.tracked = this.baseCommandForm.valueChanges.first().subscribe(change => {
            const v = Object.keys(change).map(key => change[key]);
            this.updateCmd.next(v);
        });
    }


    ngOnInit(): void {

        this.form = new FormGroup({});

        this.form.addControl("baseCommand", this.baseCommandForm);
    }

    removeBaseCommand(ctrl: { id: string, model: ExpressionModel }): void {
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this base command?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            this.formList = this.formList.filter(item => item.id !== ctrl.id);
            this.form.removeControl(ctrl.id);
            this.updateCmd.next(this.formList.map(data => data.model));
        }, err => {
            console.warn(err);
        });
    }

    addBaseCommand(): void {
        this.model.addBaseCommand();
        this.updateCmd.next(this.model.baseCommand);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.form.removeControl("baseCommand");
        this.form.removeControl("streams");
    }
}
