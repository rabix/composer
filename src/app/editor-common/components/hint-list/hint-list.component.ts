import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {CommandLineToolModel, StepModel, WorkflowModel} from "cwlts/models";
import {Subscription} from "rxjs/Subscription";
import {SystemService} from "../../../platform-providers/system.service";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: "ct-hint-list",
    template: `
            <!--Blank Tool Screen-->
            <ct-blank-tool-state *ngIf="!readonly && !model.hints.length"
                                 data-test="tool-add-hint-button"
                                 [buttonText]="'Add a Hint'"
                                 [description]=[blankStateDescription]
                                 [learnMoreURL]="'http://docs.sevenbridges.com/docs/list-of-execution-hints'"
                                 (buttonClick)="addEntry()">
            </ct-blank-tool-state>
    
            <div *ngIf="readonly && !model.hints.length" class="text-xs-center">
                This tool doesn't specify any hints
            </div>
    
            <!--List Header Row-->
            <div class="editor-list-title" *ngIf="!!model.hints.length">
                <div class="col-xs-6">
                    Class
                </div>
                <div class="col-xs-6">
                    Value
                </div>
            </div>
    
            <form [formGroup]="form" *ngIf="form">
                <ul class="editor-list" formArrayName="hints">
                    <li *ngFor="let control of form.controls['hints'].controls; let i = index">
                        <div class="flex-row">
                            <ct-requirement-input [formControl]="control"
                                                  [context]="context"
                                                  [formControlName]="i"
                                                  [classSuggest]="classSuggest"
                                                  [readonly]="readonly">
                            </ct-requirement-input>

                            <!--Actions Column-->
                            <div *ngIf="!readonly" class="remove-icon">
                                <i [ct-tooltip]="'Delete'"
                                   class="fa fa-trash clickable"
                                   (click)="removeEntry(i)"></i>
                            </div>
                        </div>
                    </li>
                </ul>
            </form>
    
            <!--Add entry link-->
            <button *ngIf="!readonly && !!model.hints.length"
                    (click)="addEntry()"
                    type="button"
                    class="btn pl-0 btn-link no-outline no-underline-hover"
                    data-test="tool-add-hint-button-small">
                <i class="fa fa-plus"></i> Add a Hint
            </button>

    `,
    styleUrls: ["./hint-list.component.scss"]
})
export class HintsComponent implements OnChanges {

    @Input()
    model: CommandLineToolModel | WorkflowModel | StepModel;

    @Input()
    classSuggest: string[];

    @Input()
    readonly = false;

    @Input()
    context: any;

    @Input()
    disabled = false;

    form: FormGroup;

    @Output()
    update = new EventEmitter();

    blankStateDescription = `Execution hints and their values, which specify
     execution requirements and suggestions, for example, the AWS instancetype to use.`;

    private sub: Subscription;

    constructor(private modal: ModalService, public system: SystemService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        const model = this.model;

        if (!this.form) {
            this.form = new FormGroup({});
        }

        if (model.hints) {
            if (this.sub) {
                this.sub.unsubscribe();
            }

            this.form.setControl("hints", new FormArray([]));

            model.hints.forEach(h => {
                (this.form.get("hints") as FormArray)
                    .push(new FormControl({value: h, disabled: this.readonly}));
            });

            this.sub = this.form.valueChanges.subscribe(form => {
                setTimeout(() => {
                    this.update.emit(this.model.hints);
                });
            });
        }
    }

    removeEntry(i: number) {
        this.modal.delete("hint").then(() => {
            this.model.hints[i].cleanValidity();
            this.model.hints.splice(i, 1);
            (this.form.get("hints") as FormArray).removeAt(i);
            this.update.emit(this.model.hints);
        }, err => {
            console.warn(err);
        });
    }

    addEntry() {
        const hint = this.model.addHint({class: "", value: ""});
        (this.form.get("hints") as FormArray).push(new FormControl({
            value: hint,
            disabled: this.readonly
        }));
        this.update.emit(this.model.hints);
    }
}
