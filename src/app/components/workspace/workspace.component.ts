import {
    Component,
    ElementRef,
    ComponentRef,
    ApplicationRef,
    ComponentResolver,
    ComponentFactory,
    Injector,
} from "@angular/core";

import {GreeterComponent} from "../greeter/greeter.component";
import * as GoldenLayout from "golden-layout";
import {Observable} from "rxjs/Observable";

require("./workspace.component.scss");

@Component({
    selector: "workspace",
    template: "",
})
export class WorkspaceComponent {

    private layout: any;

    constructor(private el: ElementRef,
                private appRef: ApplicationRef,
                private resolver: ComponentResolver,
                private injector: Injector) {

        this.layout = new GoldenLayout(this.getLayoutConfig(), this.el.nativeElement);

    }

    ngOnInit() {
        this.registerLayoutComponents();

        Observable.fromEvent(window, "resize").debounceTime(200).subscribe(() => {
            this.layout.updateSize(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
        });
    }

    ngAfterViewInit() {
        this.layout.init();
    }

    private registerLayoutComponents() {
        this.layout.registerComponent("blinger", (container, componentState) => {
            let targetElement = container.getElement()[0];

            this.resolver.resolveComponent(GreeterComponent).then((factory: ComponentFactory<any>) => {
                let comp = container.componentReference = factory.create(this.injector, [], targetElement);
                (<any>this.appRef)._loadComponent(comp);
            });
        });

        Observable.fromEvent(this.layout, "itemDestroyed")
            .filter((ev: any) => ev.type === "component")
            .map((ev: any) => ev.container.componentReference)
            .subscribe((comp: ComponentRef<GreeterComponent>) => {

                comp.changeDetectorRef.detach();
                comp.destroy();
            });

    }

    private getLayoutConfig() {
        const defaultConfig = {
            settings: {
                hasHeaders: true,
                reorderEnabled: true,
                selectionEnabled: false,
                popoutWholeStack: false,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                showCloseIcon: true,
            },
            content: [{
                type: "row",
                content: [{
                    type: "component",
                    componentName: "blinger",
                    title: "Navigation",
                    width: 25
                },
                    {
                        type: "column",
                        content: [
                            {
                                type: "component",
                                title: "my-workflow.json",
                                componentName: "blinger",
                            }, {
                                type: "component",
                                title: "my-notes.txt",
                                componentName: "blinger",
                                componentState: {label: "Component Title"}
                            }
                        ]
                    },
                ]
            }]
        };


        return defaultConfig;
    }
}
