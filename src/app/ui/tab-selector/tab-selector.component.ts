import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    QueryList,
    ViewChildren
} from "@angular/core";

@Component({
    selector: "ct-tab-selector",
    template: `
        <div class="tab-container">
            <button #buttons *ngFor="let tab of tabs" (click)="setActiveTab(tab)"
                    class="tab btn-unstyled {{ distribute }}"
                    [class.active]="active === tab">
                {{ tab }}
            </button>
        </div>
        <div class="selection-underline">
            <div *ngIf="distribute === 'auto'" class="underline-highlight"
                 [style.width.px]="highlightWidth"
                 [style.marginLeft.px]="highlightOffset"></div>

            <div *ngIf="distribute === 'equal'" class="underline-highlight"
                 [style.width.%]="100 / tabs.length"
                 [style.marginLeft.%]="tabs.indexOf(active) * 100/tabs.length"></div>
        </div>
    `,
    styleUrls: ["./tab-selector.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabSelectorComponent implements OnInit, OnChanges, AfterViewInit {

    @Input()
    tabs: any[];

    @Input()
    active: any;

    @Output()
    activeChange = new EventEmitter<any>();

    @Input()
    distribute: "equal" | "auto" = "equal";

    @ViewChildren("buttons")
    buttons: QueryList<ElementRef>;

    highlightOffset: number;

    highlightWidth: number;

    ngOnInit() {
        if (!this.active) {
            this.active = this.tabs[0];
        }
    }

    ngAfterViewInit() {
        this.updateHighlight();
    }

    public setActiveTab(tab) {
        this.active = tab;
        this.activeChange.emit(tab);
        this.updateHighlight();
    }

    ngOnChanges() {
        if (this.buttons) {
            this.updateHighlight();
        }
    }

    private updateHighlight() {

        const idx = this.tabs.indexOf(this.active);
        const buttons = this.buttons.toArray();


        let offset = 0;
        for (let i = 0; i < idx; i++) {
            offset += buttons[i].nativeElement.clientWidth;
        }

        this.highlightWidth = buttons[idx].nativeElement.clientWidth;
        this.highlightOffset = offset;
    }
}
