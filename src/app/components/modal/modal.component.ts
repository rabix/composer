import {
    Component,
    ComponentFactory,
    ComponentRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    ViewChild,
    ViewContainerRef,
    Injector
} from "@angular/core";
import {Chap} from "./../../helpers/chap";
import {ModalService} from "./modal.service";
import {Subscription, Observable, BehaviorSubject} from "rxjs/Rx";

require("./modal.component.scss");

export interface ModalOptions {
    backdrop?: boolean,
    closeOnOutsideClick?: boolean,
    closeOnEscape?: boolean
}

@Component({
    selector: "ct-modal",
    template: `
    <div #container class="ct-modal-frame">
        <div class="ct-modal-header" 
             draggable="true" 
             (dragstart)="onDragStart($event)"
             (dragend)="onDragEnd($event)">
             {{ title | async }}
         </div>
        <div #nestedComponent></div>
    </div>
    `
})
export class ModalComponent {

    @HostBinding("class.backdrop")
    private backdrop: boolean;

    @ViewChild("nestedComponent", {read: ViewContainerRef})
    private nestedComponentContainer: ViewContainerRef;

    @ViewChild("container", {read: ViewContainerRef})
    private modalWindow: ViewContainerRef;

    /** Should the modal clouse when you click on the area outside of it? */
    public closeOnOutsideClick: boolean;

    /** Title of the modal window */
    public title: BehaviorSubject<string>;

    /** When you press the "ESC" key, should the modal be closed? */
    public closeOnEscape: boolean;

    /** Holds the ComponentRef object of a component that is injected and rendered inside the modal */
    private nestedComponentRef: ComponentRef<any>;

    /** Stream of drag events */
    private dragSubscription: Subscription;

    /** Subscriptions to dispose when the modal closes */
    private subscriptions: Subscription[];

    constructor(@Inject(forwardRef(() => ModalService))
                private service: ModalService,
                private injector: Injector) {

        this.backdrop            = false;
        this.closeOnOutsideClick = true;
        this.closeOnEscape       = true;

        // FIXME: this should be passed as an argument, not fixed
        this.title     = new BehaviorSubject("New File");

        this.subscriptions = [];

        if (this.closeOnEscape) {
            this.subscriptions.push(Observable.fromEvent(document, "keyup")
                .map((ev: KeyboardEvent) => ev.which)
                .filter(key => key === 27)
                .subscribe(ev => this.service.close()));
        }
    }

    @HostListener("click", ["$event.target"])
    private onClick(target) {
        const clickInsideTheModal = this.modalWindow.element.nativeElement.contains(target);

        if (!clickInsideTheModal && this.closeOnOutsideClick) {
            this.service.close();
        }
    }

    private onDragStart(event) {
        const {clientX: startX, clientY: startY} = event;

        const style = this.modalWindow.element.nativeElement.style;
        const top   = parseFloat(style.top);
        const left  = parseFloat(style.left);

        const img = document.createElement('img');
        img.src   = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        event.dataTransfer.setDragImage(img, 0, 0);


        this.dragSubscription = Observable
            .fromEvent(event.target, "drag")
            .filter((event: MouseEvent) => event.pageX !== 0 && event.pageY !== 0)
            .subscribe((event: MouseEvent) => {
                this.reposition({
                    top: top + (event.clientY - startY) + "px",
                    left: left + (event.clientX - startX) + "px"
                })
            });
    }

    private onDragEnd(event) {
        this.dragSubscription.unsubscribe();
    }

    public configure(config: ModalOptions) {
        Chap.applyParams(config, this);
    }

    public produce(factory: ComponentFactory<any>) {

        this.nestedComponentRef = this.nestedComponentContainer.createComponent(factory, 0, this.injector);

        Observable.of("Reposition me right away!")
            .merge(Observable.fromEvent(window, "resize").debounceTime(50))
            .subscribe(s => {
                this.reposition();
            });
    }

    private reposition(tweak?: any) {

        const el = this.modalWindow.element.nativeElement as HTMLElement;

        el.style.position = "absolute";

        const {clientWidth: wWidth, clientHeight: wHeight} = document.body;
        const {clientWidth: mWidth, clientHeight: mHeight} = el;

        el.style.maxWidth  = wWidth - 50 + "px";
        el.style.maxHeight = wHeight - 50 + "px";

        if (tweak) {
            el.style.top  = tweak.top;
            el.style.left = tweak.left;
        } else {
            // Move the modal a bit more towards the top, looks better that way
            el.style.top  = (wHeight - mHeight) / 4 + "px";
            el.style.left = (wWidth - mWidth) / 2 + "px";
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.nestedComponentRef.destroy();
    }

}
