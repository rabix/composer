import {
    Component, ComponentMetadata, ComponentFactory, ComponentDecorator, ViewDecorator,
    ViewMetadata
} from "angular2/core"



export function WorkspaceComponent(config: ViewDecorator.View) {
    return function (cls) {
        let annotations = Reflect.getMetadata("annotations", cls) || [];
        annotations.push(new Component(config));
        Reflect.defineMetadata("annotations", annotations, cls);
        return cls;
    }
}
