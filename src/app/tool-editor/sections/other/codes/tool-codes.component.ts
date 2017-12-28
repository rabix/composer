import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {CommandLineToolModel} from "cwlts/models";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-codes",
    template: `
        <form class="codes-row" [formGroup]="form">

            <!--Success Codes-->
            <div class="code">
                <label class="form-control-label">Success Codes</label>
                <ct-auto-complete data-test="success-codes"
                                  [formControl]="form.controls['successCodes']" 
                                  [type]="'number'" 
                                  [readonly]="readonly"
                                  [create]="allowIntegersOnly"></ct-auto-complete>
            </div>

            <!--Temporary Fail Codes-->
            <div class="code">
                <label class="form-control-label">Temporary Fail Codes</label>
                <ct-auto-complete data-test="temporary-fail-codes"
                                  [formControl]="form.controls['temporaryFailCodes']" 
                                  [type]="'number'"
                                  [readonly]="readonly"
                                  [create]="allowIntegersOnly"></ct-auto-complete>
            </div>

            <!--Permanent Fail Codes-->
            <div class="code">
                <label class="form-control-label">Permanent Fail Codes</label>
                <ct-auto-complete data-test="permanent-fail-codes"
                                  [formControl]="form.controls['permanentFailCodes']" 
                                  [type]="'number'"
                                  [readonly]="readonly"
                                  [create]="allowIntegersOnly"></ct-auto-complete>
            </div>

        </form>
    `,
    styleUrls: ["./tool-codes.component.scss"]
})
export class ToolCodesComponent extends DirectiveBase implements OnInit, OnChanges {

    @Input()
    model: CommandLineToolModel;

    @Input()
    successCodes: number [] = [];

    @Input()
    temporaryFailCodes: number [] = [];

    @Input()
    permanentFailCodes: number [] = [];

    @Input()
    readonly = false;

    @Output()
    update = new EventEmitter<any>();

    form = new FormGroup({
        successCodes: new FormControl([]),
        temporaryFailCodes: new FormControl([]),
        permanentFailCodes: new FormControl([])
    });

    ngOnInit(): void {

        this.tracked = this.form.valueChanges.distinctUntilChanged().subscribe((form) => {

            this.model.successCodes = form["successCodes"];
            this.model.temporaryFailCodes = form["temporaryFailCodes"];
            this.model.permanentFailCodes = form["permanentFailCodes"];

            this.update.emit(form);
        });
    }

    allowIntegersOnly(input: string, callback: Function) {

        const value = parseInt(input, 10);

        if (value.toString() === input) {
            callback({
                value: value,
                text: value
            });
        } else {
            callback();
        }

    }

    ngOnChanges(): void {

        if (this.successCodes.toString() !== this.form.get("successCodes").value.toString()) {
            this.form.get("successCodes").setValue(this.successCodes, {onlySelf: true});
        }

        if (this.temporaryFailCodes.toString() !== this.form.get("temporaryFailCodes").value.toString()) {
            this.form.get("temporaryFailCodes").setValue(this.temporaryFailCodes, {onlySelf: true});
        }

        if (this.permanentFailCodes.toString() !== this.form.get("permanentFailCodes").value.toString()) {
            this.form.get("permanentFailCodes").setValue(this.permanentFailCodes, {onlySelf: true});
        }

    }
}
