import {ApplicationRef, ComponentRef, ComponentResolver, Injector} from "@angular/core";
import {DynamicState, hasDynamicState} from "../../runtime-compiler/dynamic-state.interface";
import {Observable} from "rxjs/Rx";
import {CodeEditorComponent} from "../../code-editor/code-editor.component";
import {FileModel} from "../../../store/models/fs.models";
import {EditorWrapperComponent} from "../../editor-wrapper/editor-wrapper.component";

export class ComponentRegistry {

    /**
     * Cache of components that are already registered with the GoldenLayout.
     */
    private components = {};

    constructor(private layout: any,
                private resolver: ComponentResolver,
                private injector: Injector,
                private appRef: ApplicationRef) {

        this.extractComponents(this.layout.config.content)             // Search for ng components
            .map(comp => comp.componentName)                           // take only their names
            .filter((comp, index, arr) => arr.indexOf(comp) === index) // that are unique
            .forEach(comp => this.registerComponent(comp));            // and register them for GL

        Observable.fromEvent(this.layout, "itemDestroyed")     // When the X is clicked on a tab
            .filter((ev: any) => ev.type === "component")      // and that tab contains a component
            .map((ev: any) => ev.container.componentReference) // take the contained ComponentRef
            .subscribe((comp: ComponentRef<any>) => {
                (this.appRef as any)._unloadComponent(comp);   // remove it from the comp. tree
                comp.changeDetectorRef.detach();               // remove its change detector
                comp.destroy();                                // and destroy the component
            });

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

        // Go through the current array and distribute its entries
        content.forEach(item => item.type === "component" ? components.push(item) : structures.push(item));

        // Then recurse into structures and find more components.
        return components.concat(...structures.map(structure => this.extractComponents(structure.content), []));
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
        if (this.components[<any> componentName]) {
            return;
        }

        this.components[<any> componentName] = true;
        // We need to register the function that will be called each time that particular component
        // is going to be instantiated. GL will call it again when adding components
        // later in runtime, so don't add event listeners here
        // because they would get attached multiple times.
        this.layout.registerComponent(componentName, (container, state) => {

            // DOM element into which we will insert the component
            let targetElement = container.getElement()[0];

            this.resolver.resolveComponent(<any>componentName).then(factory => {
                const componentReference     = factory.create(this.injector, [], targetElement);
                container.componentReference = componentReference;

                if (hasDynamicState(componentReference.instance)) {
                    (componentReference.instance as DynamicState).setState(state);
                }

                (this.appRef as any)._loadComponent(componentReference);


            });
        });
    }

    public getCodeEditorTabs() {
        //return this.getCodeEditorStack().contentItems.filter(item => item.componentName === CodeEditorComponent);
        return this.getCodeEditorStack().contentItems.filter(item => item.componentName === EditorWrapperComponent);
    }

    public findEditorTab(file: FileModel) {
        return this.getCodeEditorTabs().find(item => item.config.componentState.fileInfo.id === file.id);
    }

    public getCodeEditorStack() {
        return this.layout.root.contentItems[0].contentItems[1];
    }

}
