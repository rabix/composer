import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {CommandInputParameterModel, CommandOutputParameterModel, ExpressionModel} from "cwlts/models";
import {Subscription} from "rxjs/Subscription";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ErrorCode} from "cwlts/models/helpers/validation";

@Component({
    styleUrls: ["./secondary-files.component.scss"],
    selector: "ct-secondary-file",
    template: `
        <ct-form-panel class="borderless" [collapsed]="true">
            <div class="tc-header">Secondary Files</div>
            <div class="tc-body">
                <form [formGroup]="form">
                    <ct-blank-tool-state *ngIf="!readonly && !secondaryFiles.length"
                                         [buttonText]="'Add secondary file'"
                                         [description]="'No Secondary Files defined.'"
                                         (buttonClick)="addFile()">                        
                    </ct-blank-tool-state>

                    <div *ngIf="readonly && !secondaryFiles.length" class="text-xs-center">
                        No Secondary Files defined.
                    </div>

                    <ol *ngIf="secondaryFiles.length > 0" class="list-unstyled">

                        <li *ngFor="let control of form.get('list').controls; let i = index"
                            class="removable-form-control">

                            <ct-expression-input
                                    [context]="context"
                                    [formControl]="control"
                                    [readonly]="readonly">
                            </ct-expression-input>

                            <div *ngIf="!readonly" class="remove-icon"
                                 [ct-tooltip]="'Delete'"
                                 (click)="removeFile(i)">
                                <i class="fa fa-trash clickable"></i>
                            </div>
                        </li>
                    </ol>

                    <button type="button" *ngIf="secondaryFiles.length > 0 && !readonly"
                            class="btn btn-link add-btn-link no-underline-hover"
                            (click)="addFile()">
                        <i class="fa fa-plus"></i> Add secondary file
                    </button>
                </form>

            </div>
        </ct-form-panel>
    `
})

export class SecondaryFilesComponent extends DirectiveBase implements OnChanges, OnInit {

    @Input()
    public readonly = false;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job: any } = {$job: {}};

    @Input()
    port: CommandInputParameterModel | CommandOutputParameterModel;

    @Input()
    bindingName: string;

    secondaryFiles: ExpressionModel[] = [];

    @Output()
    update = new EventEmitter<ExpressionModel[]>();

    form = new FormGroup({list: new FormArray([])});

    private subscription: Subscription;

    constructor(private modal: ModalService) {
        super();
    }

    removeFile(i) {
        this.modal.delete("secondary file").then(() => {
            // reset the expression's validity
            this.secondaryFiles[i].clearIssue(ErrorCode.EXPR_ALL);
            (this.form.get("list") as FormArray).removeAt(i);
        }, err => {
            console.warn(err);
        });
    }

    addFile() {
        const cmd = this.port.addSecondaryFile(null);
        (this.form.get("list") as FormArray).push(new FormControl(cmd));
    }

    ngOnInit() {
        if (this.port) {
            this.updateFormArray();
        }
    }

    ngOnChanges() {
        if (this.port) {
            this.updateFormArray();
        }
    }

    private updateFileList() {
        this.secondaryFiles = this.port.secondaryFiles;
    }

    private updateFormArray() {
        // cancel previous subscription so recreation of form doesn't trigger an update
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }

        this.updateFileList();

        const formList = [];

        // create formControls from each secondaryFile
        for (let i = 0; i < this.secondaryFiles.length; i++) {
            formList.push(new FormControl(this.secondaryFiles[i]));
        }

        this.form.setControl("list", new FormArray(formList));

        // re-subscribe update output to form changes
        this.subscription = this.form.valueChanges.map(form => (form.list)).subscribe((list) => {
            if (list) {
                this.port.updateSecondaryFiles(list);
                this.updateFileList();
                this.updateFormArray();
                this.update.emit(list);
            }
        });
    }
}
