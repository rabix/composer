import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'ct-base-command-list',
    template: `
        <!--<ct-blank-tool-state *ngIf="!readonly && !formList.length"-->
                             <!--[buttonText]="'Add base command'"-->
                             <!--(buttonClick)="addBaseCommand()">-->

            <!--The part of the command that comes before any tool parameters or options. You can also-->
            <!--include parameters or options-->
            <!--that you want to be fixed for every execution of the tool (provided they can be placed-->
            <!--before any variable-->
            <!--parameters and options in the command line), or these can be set as arguments below.-->
        <!--</ct-blank-tool-state>-->

        <!--<div *ngIf="readonly && !formList.length" class="text-xs-center h5">-->
            <!--This tool doesn't specify any baseCommands-->
        <!--</div>-->

        <!--<ol *ngIf="formList.length > 0" class="list-unstyled">-->

            <!--<li *ngFor="let item of formList"-->
                <!--class="removable-form-control">-->

                <!--<ct-expression-input-->
                        <!--[context]="context"-->
                        <!--[formControl]="baseCommandForm.controls[item.id]"-->
                        <!--[readonly]="readonly">-->
                <!--</ct-expression-input>-->

                <!--<div *ngIf="!readonly" class="remove-icon clickable ml-1 text-hover-danger"-->
                     <!--[ct-tooltip]="'Delete'"-->
                     <!--(click)="removeBaseCommand(item)">-->
                    <!--<i class="fa fa-trash"></i>-->
                <!--</div>-->
            <!--</li>-->
        <!--</ol>-->


        <!--<button type="button" *ngIf="formList.length > 0 && !readonly"-->
                <!--class="btn btn-link add-btn-link no-underline-hover"-->
                <!--(click)="addBaseCommand()">-->
            <!--<i class="fa fa-plus"></i> Add base command-->
        <!--</button>-->
    `,
    styleUrls: ['./base-command-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseCommandListComponent implements OnInit {

    public formList = [];

    constructor() {
    }

    ngOnInit() {
    }

}
