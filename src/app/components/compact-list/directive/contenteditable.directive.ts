import {Directive, Input, Output, OnChanges, EventEmitter, ElementRef} from "@angular/core";

@Directive({
    selector: '[contenteditable]',
    host: {
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()'
    }
})
export class ContenteditableDirective implements OnChanges {
    @Input()
    public contenteditableModel: any;

    @Output()
    public contenteditableModelChange = new EventEmitter();

    private lastViewModel: any;

    constructor(private elRef: ElementRef) { }

    ngOnChanges(changes): void {
        const changedProp = changes['contenteditableModel'];

        if (this.lastViewModel !== changedProp.currentValue) {
            this.lastViewModel = changedProp.currentValue;
            this.refreshView();
        }
    }

    private onKeyUp(): void {
        const value = this.elRef.nativeElement.innerText;
        this.lastViewModel = value;
        this.contenteditableModelChange.emit(value);
    }

    private onKeyDown(event): void {
        const enterKeyCode = 13;

        //Prevent new lines
        if (event.keyCode === enterKeyCode) {
            event.preventDefault();
        }
    }

    private refreshView(): void {
        this.elRef.nativeElement.innerText = this.contenteditableModel;
    }
}
