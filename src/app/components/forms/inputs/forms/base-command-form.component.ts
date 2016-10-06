import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {
    FormGroup,
    REACTIVE_FORM_DIRECTIVES,
    FORM_DIRECTIVES,
    Validators,
    FormBuilder,
    AbstractControl
} from "@angular/forms";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {OpenExpressionEditor, CloseExpressionEditor} from "../../../../action-events/index";
import {Subscription} from "rxjs/Subscription";
import {BaseCommandService, BaseCommand} from "../../../../services/base-command/base-command.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpressionModel} from "cwlts/lib/models/d2sb";

require("./base-command-form.components.scss");

@Component({
    selector: 'base-command-form',
    providers: [
        BaseCommandService
    ],
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
             <form *ngIf="baseCommandForm" [formGroup]="baseCommandForm">
                <fieldset class="form-group">
                        <button type="button" class="btn btn-secondary hide-btn">Hide</button>
               
                        <label>Base Command</label>
                        <label class="secondary-label">What command do you want to call from the image</label>
                                                
                        <div *ngIf="baseCommandFormList.length > 0">
        
                            <div *ngFor="let baseCommand of baseCommandFormList; let i = index; trackBy: baseCommand"
                                 class="base-command-list">
                                 
                                <expression-input class="col-sm-11"
                                                  *ngIf="baseCommandForm.controls['baseCommand' + i]" 
                                                  [control]="baseCommandForm.controls['baseCommand' + i]"
                                                  (onSelect)="editBaseCommand(baseCommandForm.controls['baseCommand' + i], i)">
                                </expression-input>
                              
                                <span class="close-icon col-sm-1">
                                    <i class="fa fa-times" (click)="removeBaseCommand(i)"></i>
                                </span>
                            </div> <!-- base-command-list-->
                        </div> <!-- list container-->
        
                        <div *ngIf="baseCommandFormList.length === 0" class="col-sm-12">
                                No base command defined.
                        </div>
                </fieldset>
                
                 <button type="button" 
                         class="btn btn-secondary add-input-btn"
                         (click)="addBaseCommand()">Add base command</button>
             </form>
    `
})
export class BaseCommandFormComponent implements OnInit, OnDestroy {

    @Input()
    public toolBaseCommand: BaseCommand[];

    /** The parent forms group, we pass this to the list */
    @Input()
    public baseCommandForm: FormGroup;

    /** The formatted list that we are going to display to the user*/
    private baseCommandFormList: BaseCommand[];

    private subs: Subscription[];

    /** Expression values coming from the expression editor subs */
    private expressionInputSub: Subscription;

    private selectedIndex: number;

    constructor(private eventHubService: EventHubService,
                private baseCommandService: BaseCommandService,
                private formBuilder: FormBuilder) {

        this.subs = [];
    }

    ngOnInit(): void {
        this.baseCommandFormList = this.baseCommandService.baseCommandsToFormList(this.toolBaseCommand);
        this.baseCommandService.setBaseCommands(this.baseCommandFormList);

        this.subs.push(
            this.baseCommandService.baseCommands.subscribe((commandList: BaseCommand[]) => {
                this.baseCommandFormList = commandList;
                this.createExpressionInputForms(this.baseCommandFormList);
            })
        );
    }

    private createExpressionInputForms(commandList: BaseCommand[]) {
        commandList.forEach((command, index) => {
            let formValue: string = "";

            if (this.baseCommandForm.contains('baseCommand' + index)) {
                this.baseCommandForm.removeControl('baseCommand' + index);
            }

            if ((<ExpressionModel>command).expressionValue) {
                formValue = (<ExpressionModel>command).expressionValue;
            } else if (typeof command === "string") {
                formValue = command;
            }

            const expressionInputForm: FormGroup = this.formBuilder.group({
                ['baseCommand' + index]: [formValue, Validators.compose([Validators.required, Validators.minLength(1)])]
            });

            this.baseCommandForm.addControl('baseCommand' + index, expressionInputForm.controls['baseCommand' + index]);
        });
    }

    private removeBaseCommand(index: number): void {
        this.baseCommandService.deleteBaseCommand(index);

        if (this.selectedIndex === index) {
            this.eventHubService.publish(new CloseExpressionEditor());
        }

        if (this.selectedIndex > index) {
            this.selectedIndex--;
        } else if (this.selectedIndex === index) {
            this.selectedIndex = undefined;
        }
    }

    private editBaseCommand(inputControl: AbstractControl, index: number): void {
        const newExpression: BehaviorSubject<BaseCommand> = new BehaviorSubject<BaseCommand>(undefined);

        this.selectedIndex = index;
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((expression: ExpressionModel) => {
                this.baseCommandService.updateCommand(index, expression);
            });


        this.eventHubService.publish(new OpenExpressionEditor({
            expression: inputControl.value,
            newExpressionChange: newExpression
        }));
    }

    private addBaseCommand(): void {
        this.baseCommandService.addCommand("");
    }

    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    ngOnDestroy(): void {
        this.removeExpressionInputSub();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
