import {ComponentFactoryResolver, ComponentRef, Injectable, ViewContainerRef} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {MenuItem} from "../menu/menu-item";
import {MenuComponent} from "../menu/menu.component";

@Injectable()
export class ContextService {

    private embeddedComponent: ComponentRef<MenuComponent>;

    constructor(private resolver: ComponentFactoryResolver) {

    }

    public showAt(container: ViewContainerRef, menuItems: MenuItem[], coordinates: { x: number, y: number }) {
        this.close();
        const factory = this.resolver.resolveComponentFactory(MenuComponent);
        this.embeddedComponent = container.createComponent<MenuComponent>(factory);
        this.embeddedComponent.instance.setItems(menuItems);

        const nEl = this.embeddedComponent.location.nativeElement as HTMLElement;

        const {x, y} = coordinates;
        nEl.style.position = "fixed";
        nEl.style.left = x + "px";
        nEl.style.top = y + "px";

        Observable.fromEvent(nEl, "contextmenu").subscribe((ev: MouseEvent) => {
            ev.stopPropagation();
        });

        Observable.fromEvent(document, "click").first().subscribe(() => {
            this.close();
        });
    }


    public close() {
        if (this.embeddedComponent) {
            this.embeddedComponent.destroy();
        }
    }
}

