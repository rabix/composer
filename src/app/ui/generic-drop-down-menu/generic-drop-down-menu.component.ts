import {
    ChangeDetectionStrategy,
    Component,
    EmbeddedViewRef,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {DirectiveBase} from "../../util/directive-base/directive-base";

/**
 *  Example usage: {@link SettingsMenuComponent}
 */
@Component({
    selector: "ct-generic-dropdown-menu",
    template: `
        <button class="btn-unstyled" (click)="toggleMenu()">
            <!--Transcluded content serves as the button for toggling the dropdown-->
            <ng-content></ng-content>
        </button>

        <div class="generic-menu {{menuAlign}}-align" #dropdownContainer>
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
     * Alignment of the dropdown.
     * "right" and "left" signify to which side of the button it opens
     */
    @Input()
    menuAlign: "right" | "left" = "right";

    /**
     * Observable for externally triggering the state of
     */
    @Input()
    menuState: Observable<boolean> = Observable.of(null);

    @ViewChild("hostView", {read: ViewContainerRef})
    hostView: ViewContainerRef;

    @ViewChild("dropdownContainer", {read: ViewContainerRef})
    dropdownContainer: ViewContainerRef;

    dropdown: EmbeddedViewRef<any>;

    shouldShow = false;

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

    ngOnInit() {
        // Here we listen to external changes in the menu's state.
        // If the component using the dropdown menu sends a false value
        // down the menuState stream, the menu will close.
        this.menuState.subscribeTracked(this, (val) => this.toggleMenu(val));
    }

    private createMenu() {
        if (this.dropdown) {
            return;
        }

        this.dropdown = this.hostView.createEmbeddedView(this.content, null, 0);

        const sub = Observable.fromEvent(document, "click").filter((ev: MouseEvent) => {
            return !this.dropdownContainer.element.nativeElement.contains(ev.target as Node);
        }).skip(1).subscribe(() => {
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
