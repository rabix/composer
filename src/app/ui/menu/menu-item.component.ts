import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    AfterViewInit,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {MenuItem} from "./menu-item";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-menu-item",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./menu-item.component.scss"],
    template: `
        <span class="name">{{ item.name }}</span>

        <span class="expander">
            <i *ngIf="item?.children.length" class="fa fa-caret-right"></i>
        </span>

        <ct-menu #menu
                 class="nested"
                 *ngIf="!item.isDisabled && item.children?.length && hover"
                 [style.left.px]="menuWidth"
                 [items]="item.children">
        </ct-menu>

    `
})
export class MenuItemComponent implements OnDestroy, AfterViewInit, OnInit {
    @Input()
    item: MenuItem;

    @ViewChild("menu")
    hover: boolean;

    @HostBinding("class.disabled")
    isDisabled;

    menuWidth: string;

    subscriptions: Subscription[];

    constructor(private el: ElementRef) {
        this.hover         = false;
        this.isDisabled    = false;
        this.subscriptions = [];
    }

    ngOnInit() {
        const {isEnabled} = this.item.updates;

        if (typeof isEnabled === "boolean") {
            this.isDisabled = !isEnabled;
        } else if (isEnabled instanceof Observable) {
            this.subscriptions.push(isEnabled.distinctUntilChanged().subscribe(enabled => {
                this.isDisabled = !enabled;
            }));
        }
    }

    ngAfterViewInit() {
        this.menuWidth = this.el.nativeElement.clientWidth;
    }

    @HostListener("mouseenter")
    onMouseEnter() {
        this.hover = true;
    }

    @HostListener("mouseleave")
    onMouseLeave() {
        this.hover = false;
    }

    @HostListener("click")
    private onClick() {
        const {click} = this.item.updates;

        if (click instanceof Subject) {
            click.next(this.item);
        } else if (typeof click === "function") {
            click(this.item);
        }
    }


    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }
}
