import {ElementRef, Input, Directive} from '@angular/core';
import {MarkdownService} from "./markdown.service";


@Directive({
    selector: '[ct-markdown]',
})
export class MarkdownDirective {

    private el: HTMLElement;

    constructor(el: ElementRef, private markDownService: MarkdownService) {
        this.el = el.nativeElement;
    }

    @Input("ct-markdown")
    set md(value: string) {
        this.el.innerHTML = value ? this.markDownService.parse(value) : "";
    }
}
