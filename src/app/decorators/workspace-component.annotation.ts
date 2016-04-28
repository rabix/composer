import {
    ComponentMetadata, ComponentDecorator, ComponentFactory, ChangeDetectionStrategy,
    ViewEncapsulation, Type
} from "angular2/core";

import {Component} from "angular2/core"

export function WorkspaceComponent(config): any {
    console.log('Config', config);
    return function (cls) {
        let annotations = Reflect.getMetadata("annotations", cls) || [];
        annotations.push(new Component(config));
        Reflect.defineMetadata("annotations", annotations, cls);
        console.log('CLS', cls);
        return cls;
    }
}
