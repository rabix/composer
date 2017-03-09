import {
    Component,
    Input,
    ElementRef,
    ViewChild,
    Renderer,
    Output,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'ct-inline-editor',
    encapsulation: ViewEncapsulation.Emulated,
    styleUrls: ["./inline-editor.component.scss"],
    template: `
    <div>
      <div *ngIf="editing">
        <input #inlineEditControl *ngIf="type === 'text'" [required]="required" [type]="type" [placeholder]="label" value="{{value}}" [(ngModel)]="inputval"/>
        <textarea #inlineEditControl *ngIf="type === 'textarea'" [required]="required" [name]="value" rows="20" [(ngModel)]="inputval">{{value}}</textarea>
      </div>
      <div *ngIf="editing">
        <input type="button" value="Ok" class="btn btn-primary btn-sm" (click)="onSave($event)"/>
        <input type="button" value="Cancel" class="btn btn-secondary btn-sm" (click)="onCancel($event)"/>
      </div>
      <div *ngIf="!editing" (mouseenter)="showEdit($event);" (mouseleave)="hideEdit($event)">
        <a *ngIf="isHover" href="" class="edit" (click)="edit($event)">Edit</a>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class InlineEditorComponent  {
    @ViewChild('inlineEditControl')
    inlineEditControl: ElementRef;

    @Input()
    public value: string = '';

    @Input()
    public label: string = '';

    @Input()
    public type: string = 'text';

    @Input()
    public required: boolean = false;

    @Input()
    public disabled: boolean = false;

    @Output()
    public saveData: EventEmitter<string> = new EventEmitter<string>();

    private editing: boolean = false;
    private inputval: string = '';
    private isHover: boolean = false;
    public onChange: any = Function.prototype;

    constructor(element: ElementRef, private _renderer: Renderer) {
    }

    onCancel($event: Event) {
        this.editing = false;
    }

    onSave($event: Event) {
        this.saveData.emit(this.inputval);

        this.editing = false;
    }

    edit($event: Event) {
        $event.preventDefault();

        if (this.disabled) {
            return;
        }

        this.editing = true;
        // Focus on the input element just as the editing begins
        // setTimeout(_ => this._renderer.invokeElementMethod(this.inlineEditControl,
        //                                                    'focus', []));

    }

    ngOnInit() {
        this.inputval = this.value;
    }

    private showEdit($event: Event) {
        this.isHover = true;
    }

    private hideEdit($event: Event) {
        this.isHover = false;
    }
}
