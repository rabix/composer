import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EmbeddedViewRef, Input, OnInit, TemplateRef, ViewChild,
    ViewContainerRef
} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {fromEvent} from "rxjs/observable/fromEvent";
import {skip, filter} from "rxjs/operators";

/**
 *  Example usage: {@link SettingsMenuComponent}
 */
@Component({
    selector: "ct-generic-dropdown-menu",
    template: `
        <span class="generic-dropdown-button">
            <!--Transcluded content serves as the button for toggling the dropdown-->
            <ng-content></ng-content>
        </span>

        <div class="{{menuAlign}}-align" [class.top]="menuSide === 'top'" [class.generic-menu]="dropdown" #dropdownContainer>
            <div #hostView></div>
        </div>
    `,
    styleUrls: ["./generic-drop-down-menu.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDropDownMenuComponent extends DirectiveBase implements OnInit {

    /**
     * Template ref which will be embedded into the "dropdown" section
     */
    @Input("ct-menu")
    content: TemplateRef<any>;

    /**
     +     * Sets readonly property on component
     +     */
    @Input("readonly")
    readonly: boolean;

    /**
     * Alignment of the dropdown.
     * "right" and "left" signify to which side of the button it opens
     */
    @Input()
    menuAlign: "right" | "left" = "right";

    @Input()
    menuSide: "top" | "bottom" = "bottom";

    /**
     * Observable for externally triggering the state of
     */
    @Input()
    menuState: Observable<boolean>;

    @ViewChild("hostView", {read: ViewContainerRef})
    hostView: ViewContainerRef;

    @ViewChild("dropdownContainer", {read: ViewContainerRef})
    dropdownContainer: ViewContainerRef;

    dropdown: EmbeddedViewRef<any>;

    shouldShow = false;

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    /**
     * Toggles the menu or sets the visibility to the provided value
     * @param value
     */
    toggleMenu(value?: boolean) {
        typeof value === "boolean" ? this.shouldShow = value : this.shouldShow = !this.shouldShow;

        if (this.shouldShow) {
            this.createMenu();
        } else {
            this.destroyMenu();
        }
    }

    show() {
        if (!this.dropdown) {
            this.createMenu();
        }
    }

    hide() {
        if (this.dropdown) {
            this.destroyMenu();
        }
    }

    ngOnInit() {
        // Here we listen to external changes in the menu's state.
        // If the component using the dropdown menu sends a false value
        // down the menuState stream, the menu will close.
        if (this.menuState) {
            this.menuState.subscribeTracked(this, (val) => {
                this.toggleMenu(val);
            });
        } else {
            this.toggleMenu(false);
        }
    }

    private createMenu() {

        if (this.dropdown) {
            return;
        }

        this.dropdown = this.hostView.createEmbeddedView(this.content, null, 0);

        this.cdr.markForCheck();

        const sub = fromEvent(document, "click").pipe(
            filter((ev: MouseEvent) => !this.dropdownContainer.element.nativeElement.contains(ev.target as Node)),
            skip(1)
        ).subscribe(() => {
            this.toggleMenu(false);
            sub.unsubscribe();
        });
    }

    private destroyMenu() {
        if (this.dropdown) {
            this.dropdown.destroy();
            this.dropdown = null;
        }
    }
}
