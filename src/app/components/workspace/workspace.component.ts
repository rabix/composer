import {
    Component,
    ElementRef,
    ComponentRef,
    Directive,
    DynamicComponentLoader,
    ApplicationRef,
    Injector
} from "@angular/core";

import {GreeterComponent} from "../greeter/greeter.component";
import {Observable} from "rxjs/Observable";
import * as GoldenLayout from "golden-layout";

require("./workspace.component.scss");

@Component({
    selector: "workspace",
    template: "",
})
export class WorkspaceComponent {

    private layout: any;
    private el: ElementRef;
    private dcl: DynamicComponentLoader;
    private appRef: ApplicationRef;
    private injector: Injector;

    constructor(el: ElementRef, dcl: DynamicComponentLoader, appRef: ApplicationRef, injector: Injector) {
        this.el       = el;
        this.dcl      = dcl;
        this.appRef   = appRef;
        this.injector = injector;
        this.layout   = new GoldenLayout(this.getLayoutConfig(), this.el.nativeElement);
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

            this.dcl.loadAsRoot(GreeterComponent, targetElement, this.injector)
                .then((comp)=> {

                    container.componentReference = comp;

                    (<any>this.appRef)._loadComponent(comp);
                    return comp;
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
