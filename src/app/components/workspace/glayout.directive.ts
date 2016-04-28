import {
    Input, ElementRef, OnInit, DynamicComponentLoader, Injector, ApplicationRef,
    Component, Directive, ComponentRef
} from "angular2/core";
import * as GoldenLayout from "golden-layout";
import {GreeterComponent} from "../greeter/greeter.component";

@Directive({
    selector: "[glayout]"
})
export class GLayoutDirective implements OnInit {

    @Input("config")
    private configInput: Object;

    private config: Object;
    private layout: any;

    // Injected Dependencies
    private el: ElementRef;
    private dcl: DynamicComponentLoader;
    private injector: Injector;
    private appRef: ApplicationRef;

    static componentCount = 0;

    constructor(el: ElementRef,
                dcl: DynamicComponentLoader,
                appRef: ApplicationRef,
                injector: Injector) {

        console.log('Finished glayout');


        this.el       = el;
        this.dcl      = dcl;
        this.appRef   = appRef;
        this.injector = injector;
    }

    ngOnInit(): any {
        const config = this.provideLayoutConfig();
        console.log('Layout config', config);

        this.layout = new GoldenLayout(config, this.el.nativeElement);

        this.layout.registerComponent("blinger", (container, componentState) => {


            return true;

            let componentId = `component_${GLayoutDirective.componentCount}`;

            // Create an empty div in the container
            container.getElement().html(`<div id="${componentId}"></div>`);

            this.dcl.loadAsRoot(GreeterComponent, `#${componentId}`, this.injector).then((compRef: ComponentRef) => {
                container.compRef = compRef;
                //noinspection TypeScriptUnresolvedFunction
                this.appRef._loadComponent(compRef);

                if (compRef.instance.ngOnChanges) {
                    compRef.instance.ngOnChanges();
                }

                //noinspection TypeScriptUnresolvedVariable
                compRef.location.internalElement.parentView.changeDetector.ref.detectChanges();
                return compRef;
            });
            //
            GLayoutDirective.componentCount++;
            //
            //
            // container.getElement().html('<h2>' + componentState.label + '</h2>');
        });

        setTimeout(() => {
            this.layout.init();
        });
    }

    private provideLayoutConfig() {
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

        return this.config = this.configInput || defaultConfig;
    }
}
