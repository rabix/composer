import {
    AfterViewInit,
    Component,
    ComponentFactory,
    ComponentRef,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Injector,
    Renderer,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {ModalOptions} from "./modal-options";
import {ModalService} from "./modal.service";
import {of} from "rxjs/observable/of";
import {merge, debounceTime, filter, map} from "rxjs/operators";
import {fromEvent} from "rxjs/observable/fromEvent";

@Component({
    selector: "ct-modal",
    template: `
        <div #container class="ui-modal-frame">
            <div #header class="pl-1 ui-modal-header">
                <div class="ui-modal-title">
                    {{ title }}
                </div>

                <div class="ui-modal-close-icon">
                    <i class="fa fa-times pr-1 clickable" (click)="close()"></i>
                </div>

            </div>
            <div #nestedComponent></div>
        </div>
    `,
    styleUrls: ["./modal.component.scss"],
})
export class ModalComponent extends DirectiveBase implements AfterViewInit {

    @HostBinding("class.backdrop")
    backdrop = false;

    /** Should the modal clouse when you click on the area outside of it? */
    closeOnOutsideClick = false;

    /** Title of the modal window */
    title: string;

    /** When you press the "ESC" key, should the modal be closed? */
    closeOnEscape: true;

    /** Holds the ComponentRef object of a component that is injected and rendered inside the modal */
    nestedComponentRef: ComponentRef<any>;

    @ViewChild("nestedComponent", {read: ViewContainerRef})
    private nestedComponent: ViewContainerRef;

    @ViewChild("container", {read: ViewContainerRef})
    private modalWindow: ViewContainerRef;

    @ViewChild("header", {read: ElementRef})
    private headerElement: ElementRef;

    constructor(@Inject(forwardRef(() => ModalService))
                private service: ModalService,
                private renderer: Renderer,
                private hostElement: ElementRef,
                private injector: Injector) {
        super();

        fromEvent(document, "keyup").pipe(
            filter(() => this.closeOnEscape),
            map((ev: KeyboardEvent) => ev.which),
            filter(key => key === 27)
        ).subscribeTracked(this, () => {
            this.service.close()
        });
    }

    /** When click on X icon */
    close() {
        this.service.close();
    }

    @HostListener("click", ["$event.target"])
    private onClick(target) {

        let isUnderModal   = false;
        let elementDeleted = true;
        let elementRoot    = target;

        do {
            if (elementRoot === this.modalWindow.element.nativeElement) {
                isUnderModal = true;
                break;
            }

            if (elementRoot === document) {
                elementDeleted = false;
            }
        } while (elementRoot = elementRoot.parentNode);

        const clickedOutsideModal = !isUnderModal && !elementDeleted;

        if (this.closeOnOutsideClick && clickedOutsideModal) {
            this.service.close();
        }
    }

    ngAfterViewInit() {
        this.reposition();
    }

    configure(config: ModalOptions) {

        Object.assign(this, config);
        if (typeof config.title === "string") {
            this.title = config.title;
        }
    }

    produce<T>(factory: ComponentFactory<T>): ComponentRef<T> {

        this.nestedComponentRef = this.nestedComponent.createComponent(factory, 0, this.injector);

        of(1).pipe(
            merge(fromEvent(window, "resize").pipe(
                debounceTime(50)
            ))
        ).subscribeTracked(this, () => {
            this.reposition();
        });

        return this.nestedComponentRef;
    }

    embed<T>(template: TemplateRef<T>): void {

        this.tracked = this.nestedComponent.createEmbeddedView(template);
        this.reposition();
    }

    private reposition(tweak?: { left: number, top: number }) {

        const el = this.modalWindow.element.nativeElement as HTMLElement;

        const {clientWidth: wWidth, clientHeight: wHeight} = this.hostElement.nativeElement;
        const {clientWidth: mWidth, clientHeight: mHeight} = el;
        const styleUpdate                                  = {
            position: "absolute",
            maxWidth: wWidth - 50,
            top: (wHeight - mHeight) / 4 + "px",
            left: (wWidth - mWidth) / 2 + "px"
        };

        if (tweak) {
            Object.assign(styleUpdate, {
                top: Number(el.style.top) + tweak.top + "px",
                left: Number(el.style.left) + tweak.left + "px",
            });
        }

        Object.keys(styleUpdate).forEach(k => this.renderer.setElementStyle(el, k, styleUpdate[k]));
    }
}
