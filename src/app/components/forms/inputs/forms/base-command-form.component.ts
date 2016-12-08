import {Component, Input, OnInit, OnDestroy, Output} from "@angular/core";
import {Validators, FormControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../../../common/component-base";
import {ExpressionModelListComponent} from "../../../../editor-common/components/expression-model-list/expression-model-list.componen";

require("./base-command-form.components.scss");

@Component({
    selector: 'base-command-form',
    directives: [
        ExpressionModelListComponent
    ],
    template: `<ct-form-panel>
    <div class="tc-header">
        Base Command
    </div>
    <div class="tc-body">
    
        <expression-model-list 
                [context]="context"
                [emptyListText]="'No base command defined.'"
                [addButtonText]="'Add base command'"
                [formControl]="baseCommandForm"></expression-model-list>
    </div>
</ct-form-panel>

    `
})
//TODO: change to custom form
export class BaseCommandFormComponent extends ComponentBase implements OnInit, OnDestroy {
    /** baseCommand property of model */
    @Input()
    public baseCommand: ExpressionModel[];

    /** Update event triggered on form changes (add, remove, edit) */
    @Output()
    public update = new ReplaySubject<ExpressionModel[]>();

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    private baseCommandForm: FormControl;


    ngOnInit(): void {
        this.baseCommandForm = new FormControl(this.baseCommand, [Validators.required]);

        this.tracked = this.baseCommandForm.valueChanges.subscribe(change => {
            this.update.next(change);
        });
    }
}
