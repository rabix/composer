import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    QueryList,
    Renderer,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TabSelectorEntryComponent} from "./tab-selector-entry/tab-selector-entry.component";
import {TabSelectorService} from "./tab-selector.service";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
    selector: "ct-tab-selector",
    providers: [TabSelectorService],
    template: `
        <div class="tab-container {{ distribute }} deep-unselectable">
            <ng-content></ng-content>
        </div>
        <div class="selection-underline">
            <div *ngIf="distribute === 'auto'" #autoHighlighter class="underline-highlight"></div>

            <div *ngIf="distribute === 'equal'" class="underline-highlight"
                 [style.width.%]="100 / tabEntries.length"
                 [style.marginLeft.%]="leftMarginPc"></div>
        </div>
    `,
    styleUrls: ["./tab-selector.component.scss"],
})
export class TabSelectorComponent extends DirectiveBase implements OnInit, AfterViewInit, OnChanges {

    @Input()
    active: string;

    @Output()
    activeChange = new EventEmitter<string>();

    @Input()
    distribute: "equal" | "auto" = "equal";

    @ViewChild("autoHighlighter", {read: ElementRef})
    autoHighlight: ElementRef;

    @ContentChildren(TabSelectorEntryComponent)
    tabEntries: QueryList<TabSelectorEntryComponent>;

    @ContentChildren(TabSelectorEntryComponent, {read: ElementRef})
    tabEntryElements: QueryList<ElementRef>;

    leftMarginPc = 0;

    constructor(private selector: TabSelectorService,
                private cdr: ChangeDetectorRef,
                private renderer: Renderer) {
        super();
    }

    ngOnInit() {
        this.activateTab(this.active);
    }

    activateTab(tabName: string) {
        this.selector.selectedTab.next(tabName);
    }

    ngAfterViewInit() {

        setTimeout(() => {
            this.tracked = this.selector.selectedTab.pipe(
                distinctUntilChanged()
            ).subscribe((tab) => {

                this.active = tab;
                this.activeChange.emit(tab);

                this.leftMarginPc = this.tabEntries.toArray().findIndex(t => t.tabName === this.active) * 100 / this.tabEntries.length;

                this.updateHighlight();
                this.cdr.markForCheck();
            });
        });

    }

    private updateHighlight() {
        if (this.distribute === "equal"
            || !this.active
            || !this.tabEntries
            || !this.autoHighlight
        ) {
            return;
        }

        const idx = this.tabEntries.toArray().findIndex(tab => tab.tabName === this.active);
        if (idx === -1) {
            throw new Error(`Tab entry "${this.active}" does not exist in tab entries "${this.tabEntries.toArray().join(", ")}"`);
        }
        const entries = this.tabEntryElements.toArray();

        let offset = 0;
        for (let i = 0; i < idx; i++) {
            offset += entries[i].nativeElement.clientWidth;
        }

        this.renderer.setElementStyle(this.autoHighlight.nativeElement, "width", entries[idx].nativeElement.clientWidth + "px");
        this.renderer.setElementStyle(this.autoHighlight.nativeElement, "marginLeft", offset + "px");
    }

    ngOnChanges(changes: SimpleChanges) {
        this.selector.selectedTab.next(this.active);
        this.updateHighlight();
    }


}
