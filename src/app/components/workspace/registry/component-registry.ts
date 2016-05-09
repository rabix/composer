import {ComponentResolver, ComponentFactory, Injector, ApplicationRef, ComponentRef} from "@angular/core";
import {Observable} from "rxjs/Observable";
export class ComponentRegistry {

    private components = {};

    constructor(private layout: any,
                private resolver: ComponentResolver,
                private injector: Injector,
                private appRef: ApplicationRef) {

        this.extractComponents(this.layout.config.content) // Recursive search for components
            .map(comp => comp.componentName) // Take our component entries from the object
            .filter((comp, index, arr) => arr.indexOf(comp) === index) // Take only unique values
            .forEach((comp) => this.registerComponent(comp)); // Register them

    }

    private extractComponents(content) {

        const components = [],
              structures = [];

        content.forEach((item) => item.type === "component" ? components.push(item) : structures.push(item));

        return components.concat(...structures.map((structure) => this.extractComponents(structure.content), []));
    }

    public register(component: any): string {


        if (this.components[component]) {
            return this.components[component].component;
        }

        this.registerComponent(component);

        return component;

    }

    private registerComponent(componentName: string): void {

        this.layout.registerComponent(componentName, (container, state) => {
            let targetElement = container.getElement()[0];

            this.resolver.resolveComponent(<any>componentName).then((factory: ComponentFactory<any>)=> {
                let comp = container.componentReference = factory.create(this.injector, [], targetElement);
                (<any>this.appRef)._loadComponent(comp);

                this.components[componentName] = {
                    name: componentName,
                    component: comp
                };

                //noinspection TypeScriptUnresolvedFunction
                Observable.fromEvent(this.layout, "itemDestroyed")
                    .filter((ev: any) => ev.type === "component")
                    .map((ev: any) => ev.container.componentReference)
                    .subscribe((comp: ComponentRef<any>) => {

                        comp.changeDetectorRef.detach();
                        comp.destroy();
                    });


            });
        });

    }
}
