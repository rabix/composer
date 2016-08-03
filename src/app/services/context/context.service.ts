import {Injectable, ViewContainerRef, ComponentResolver, ComponentRef} from "@angular/core";
import {MenuComponent} from "../../components/menu/menu.component";
import {MenuItem} from "../../components/menu/menu-item";
import {Observable} from "rxjs";

@Injectable()
export class ContextService {

    private anchor: ViewContainerRef;

    private embeddedComponent: ComponentRef<MenuComponent>;

    constructor(private resolver: ComponentResolver) {
    }

    public setAnchor(view: ViewContainerRef) {
        this.anchor = view;
    }

    public showAt(menuItems: MenuItem[], coordinates: {x: number, y: number}) {
        this.close();
        this.resolver.resolveComponent(MenuComponent).then(factory => {
            this.embeddedComponent = this.anchor.createComponent<MenuComponent>(factory);
            this.embeddedComponent.instance.setItems(menuItems);

            const nEl = this.embeddedComponent.location.nativeElement as HTMLElement;

            const {x, y}       = coordinates;
            nEl.style.position = "absolute";
            nEl.style.left     = x + "px";
            nEl.style.top      = y + "px";

            Observable.fromEvent(document, "click").first().subscribe(_ => {
                this.close();
            });
        });
    }

    public close() {
        if (this.embeddedComponent) {
            this.embeddedComponent.destroy();
        }
    }
}

