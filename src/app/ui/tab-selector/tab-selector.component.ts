import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    Renderer,
    ViewChild
} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TabSelectorEntryComponent} from "./tab-selector-entry/tab-selector-entry.component";
import {TabSelectorService} from "./tab-selector.service";

@Component({
    selector: "ct-tab-selector",
    providers: [TabSelectorService],
    template: `
        <div class="tab-container {{ distribute }}">
            <ng-content></ng-content>
        </div>
        <div class="selection-underline">
            <div *ngIf="distribute === 'auto'" #autoHighlighter class="underline-highlight"></div>

            <div *ngIf="distribute === 'equal'" class="underline-highlight"
                 [style.width.%]="100 / tabEntries.length"
                 [style.marginLeft.%]="tabEntries.toArray().indexOf(active) * 100/tabEntries.length"></div>
        </div>
    `,
    styleUrls: ["./tab-selector.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabSelectorComponent extends DirectiveBase implements OnInit, AfterViewInit {

    @Input()
    active: any;

    @Output()
    activeChange = new EventEmitter<any>();

    @Input()
    distribute: "equal" | "auto" = "equal";

    @ViewChild("autoHighlighter", {read: ElementRef})
    autoHighlight: ElementRef;

    @ContentChildren(TabSelectorEntryComponent)
    tabEntries: QueryList<TabSelectorEntryComponent>;

    @ContentChildren(TabSelectorEntryComponent, {read: ElementRef})
    tabEntryElements: QueryList<ElementRef>;

    constructor(private selector: TabSelectorService,
                private cdr: ChangeDetectorRef,
                private renderer: Renderer) {
        super();
    }

    ngOnInit() {
        this.selector.selectedTab.next(this.active);
    }

    ngAfterViewInit() {
        this.tracked = this.selector.selectedTab.subscribe((tab) => {
            this.active = tab;
            this.activeChange.emit(tab);

            this.updateHighlight();
            this.cdr.markForCheck();
        });
    }

    private updateHighlight() {
        if (this.distribute === "equal" || !this.active) {
            return;
        }

        const idx     = this.tabEntries.toArray().indexOf(this.active);
        const entries = this.tabEntryElements.toArray();

        let offset = 0;
        for (let i = 0; i < idx; i++) {
            offset += entries[i].nativeElement.clientWidth;
        }

        this.renderer.setElementStyle(this.autoHighlight.nativeElement, "width", entries[idx].nativeElement.clientWidth + "px");
        this.renderer.setElementStyle(this.autoHighlight.nativeElement, "marginLeft", offset + "px");
    }
}
