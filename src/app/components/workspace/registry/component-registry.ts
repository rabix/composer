import {
    ComponentResolver,
    ComponentFactory,
    Injector,
    ApplicationRef,
    ComponentRef
} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {CodeEditorComponent} from "../../code-editor/code-editor.component";
import {FileEditorPlaceholderComponent} from "../../placeholders/file-editor/file-editor-placeholder.component";


export class ComponentRegistry {

    private components = {};

    constructor(private layout: any,
                private resolver: ComponentResolver,
                private injector: Injector,
                private appRef: ApplicationRef) {

        this.extractComponents(this.layout.config.content) // Recursive search for components
            .map(comp => comp.componentName) // Take our component entries from the object
            .filter((comp, index, arr) => arr.indexOf(comp) === index) // Take only unique values
            .forEach((comp) => {
                this.registerComponent(comp)
            }); // Register them
        
    }

    /**
     * Extracts the Components from the GL's component hierarchy.
     *
     * @param content GL's "content" attribute which contains a tree of rows/columns/components
     * @returns {any[]}
     *
     */
    private extractComponents(content: any[]) {

        // We'll split nodes in the "content" tree into these two groups
        const components = [], // We need to extract these
              structures = []; // And traverse into these so we can find more components

        // Go through the current array and distribute it's entries
        content.forEach((item) => item.type === "component" ? components.push(item) : structures.push(item));

        // Then recurse into structures and find more components.
        return components.concat(...structures.map((structure) => this.extractComponents(structure.content), []));
    }

    /**
     * Registers an Angular @Component so it can be used within the layout.
     *
     * Example:
     * import {MyComponent} from "./app/components/my-component.ts";
     * this.registerComponent(MyComponent);
     *
     * @param componentName
     */
    public registerComponent(componentName: Function): void {
        if (this.components[componentName]) {
            return;
        }

        // We need to register the function that will be called each time that particular component
        // is going to be instantiated. GL will call it again when adding components
        // later in runtime, so don't add event listeners here
        // because they would get attached multiple times.
        this.layout.registerComponent(componentName, (container, state) => {

            // DOM element into which we will insert the component
            let targetElement = container.getElement()[0];

            this.resolver.resolveComponent(<any>componentName).then((factory: ComponentFactory<any>)=> {
                let comp = container.componentReference = factory.create(this.injector, [], targetElement);
                if (typeof comp.instance["setState"] === "function") {
                    comp.instance.setState(state);
                }


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
