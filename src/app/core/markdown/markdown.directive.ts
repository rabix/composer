import {ElementRef, Input, Directive} from '@angular/core';
import {MarkDownService} from "./markdown.service";


@Directive({
    selector: '[ct-markdown]',
})
export class MarkdownDirective {

    private el: HTMLElement;

    constructor(el: ElementRef, private markDownService: MarkDownService) {
        this.el = el.nativeElement;
    }

    @Input("ct-markdown")
    set md(value: string) {
        this.el.innerHTML = value ? this.markDownService.parse(value) : "";
    }
}
