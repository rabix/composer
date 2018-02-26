import {ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef} from "@angular/core";
import {MenuItem} from "../menu/menu-item";
import {MenuComponent} from "../menu/menu.component";
import {fromEvent} from "rxjs/observable/fromEvent";
import {take} from "rxjs/operators";

@Injectable()
export class ContextService {

    private embeddedComponent: ComponentRef<MenuComponent>;

    constructor(private resolver: ComponentFactoryResolver) {

    }

    showAt(container: ViewContainerRef, menuItems: MenuItem[], coordinates: { x: number, y: number }) {
        this.close();
        const factory = this.resolver.resolveComponentFactory(MenuComponent);
        this.embeddedComponent = container.createComponent<MenuComponent>(factory);
        this.embeddedComponent.instance.setItems(menuItems);

        const nEl = this.embeddedComponent.location.nativeElement as HTMLElement;

        const {x, y} = coordinates;
        nEl.style.position = "fixed";
        nEl.style.left = x + "px";
        nEl.style.top = y + "px";

        fromEvent(nEl, "contextmenu").subscribe((ev: MouseEvent) => {
            ev.stopPropagation();
        });

        fromEvent(document, "click").pipe(
            take(1)
        ).subscribe(() => {
            this.close();
        });
    }


    close() {
        if (this.embeddedComponent) {
            this.embeddedComponent.destroy();
        }
    }
}

