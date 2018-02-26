import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {MenuItem} from "./menu-item";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {distinctUntilChanged} from "rxjs/operators";

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
export class MenuItemComponent extends DirectiveBase implements OnDestroy, AfterViewInit, OnInit {
    @Input()
    item: MenuItem;

    @ViewChild("menu")
    hover: boolean;

    @HostBinding("class.disabled")
    isDisabled;

    menuWidth: string;

    constructor(private el: ElementRef) {
        super();
        this.hover         = false;
        this.isDisabled    = false;
    }

    ngOnInit() {
        const {isEnabled} = this.item.updates;

        if (typeof isEnabled === "boolean") {
            this.isDisabled = !isEnabled;
        } else if (isEnabled instanceof Observable) {

            isEnabled.pipe(
                distinctUntilChanged()
            ).subscribeTracked(this, enabled => {
                this.isDisabled = !enabled;
            });
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
}
