import {AfterViewInit, Component, ElementRef, HostBinding, Input, ViewChild} from "@angular/core";

@Component({
    selector: "ct-loader-button-content",
    styleUrls: ["loader-button-content.component.scss"],
    template: `
        <span #content>
            <ng-content *ngIf="!isLoading"></ng-content>
        </span>
        <span class="loader" *ngIf="isLoading"></span>
    `
})

export class LoaderButtonContentComponent implements AfterViewInit {

    @HostBinding("style.minWidth.px")
    minWidth;

    @ViewChild("content", {read: ElementRef})
    originalContent: ElementRef;

    @Input() isLoading = false;

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.minWidth = this.originalContent.nativeElement.getBoundingClientRect().width;
        });

    }
}
