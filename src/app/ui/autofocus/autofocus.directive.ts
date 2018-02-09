import {Directive, ElementRef, OnInit} from "@angular/core";

@Directive({
    selector: "[ct-autofocus], [autofocus]"
})
export class AutofocusDirective implements OnInit {

    constructor(private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.elementRef.nativeElement.focus();
    }
}
