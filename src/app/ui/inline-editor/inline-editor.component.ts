import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";

import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-inline-editor",
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ["./inline-editor.component.scss"],
    template: `
        <div  (mouseenter)="showEdit()" (mouseleave)="hideEdit()">
            <div [class.hover]="isHover && !editing" class="inline-section" (click)="edit($event)">

                <!--Editing mode-->
                <div *ngIf="editing">
                    <input class="form-control" *ngIf="type === 'text'" [type]="type" [placeholder]="label" [(ngModel)]="value"/>
                    
                    <textarea class="form-control" *ngIf="type === 'textarea'" [name]="value" rows="20" [(ngModel)]="value"></textarea>
                    
                    <ct-key-value *ngIf="type === 'keyvalue'" [(ngModel)]="value" [keyLabel]="keyLabel" [valueLabel]="valueLabel"></ct-key-value>

                    <ct-auto-complete *ngIf="type === 'tags'"  [name]="value" [options]="options"
                                      [(ngModel)]="value" [create]="true">

                    </ct-auto-complete>

                    <!--Save/Cancel button-->
                    <div *ngIf="editing" class="button-section">
                        <button type="button" class="btn btn-secondary btn-sm inline-control-btn" (click)="onCancel($event)">Cancel</button>
                        <button type="button" class="btn btn-primary btn-sm inline-control-btn" (click)="onSave($event)">Save</button>
                    </div>
                </div>

                <!--Edit button-->
                <div *ngIf="isHover && !editing" class="button-section">
                    <button class="btn btn-secondary btn-sm"
                            (click)="edit($event)">Edit
                    </button>
                </div>

                <!--Not Editing mode mode-->
                <div *ngIf="!editing">

                    <div *ngIf="isHover" class="button-section">
                        <button class="btn btn-secondary btn-sm"
                                (click)="edit($event)">Edit
                        </button>
                    </div>
                    
                    <ng-content></ng-content>

                    <!--Empty state-->
                    <div *ngIf="isEmpty()">None</div>
                </div>

            </div>
        </div>

    `
})
export class InlineEditorComponent extends DirectiveBase {

    @Input()
    options = [];

    @Input()
    value: any;

    @Input()
    label = "";

    @Input()
    type = "text";

    @Input()
    disabled = false;

    @Output()
    saveData: EventEmitter<string> = new EventEmitter<string>();

    @Input()
    keyLabel = "key";

    @Input()
    valueLabel = "value";

    editing = false;
    isHover = false;

    originalValue: any;


    onCancel($event: Event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.value = this.originalValue;

        this.isHover = false;
        this.editing = false;
    }

    onSave($event: Event) {
        $event.preventDefault();
        $event.stopPropagation();

        this.saveData.emit(this.value);

        this.editing = false;
        this.isHover = false;
    }

    edit($event: Event) {
        $event.preventDefault();
        $event.stopPropagation();

        if (this.editing || this.disabled) {
            return;
        }

        this.originalValue = this.value;

        this.isHover = false;
        this.editing = true;
    }

    showEdit() {
        if (this.disabled) {
            return;
        }
        this.isHover = true;
    }

    hideEdit() {
        if (this.disabled) {
            return;
        }
        this.isHover = false;
    }

    // Is value is empty show "None"
    isEmpty() {
        return Array.isArray(this.value) ? this.value.length === 0 : !this.value;
    }
}
