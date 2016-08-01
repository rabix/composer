import {Component, OnInit, Input, ComponentResolver, ComponentFactory} from "@angular/core";
import {INPUT_PROPERTY_TYPE} from "./types/input-types";
import {DynamicComponentContext} from "../../runtime-compiler/dynamic-component-context";
import {ComponentCompilerDirective} from "../../runtime-compiler/component-compiler.directive";
import {BaseCommandFormComponent} from "./forms/base-command-form.component";
import {DockerInputFormComponent} from "./forms/docker-input-form.component";

require ("./property-input.component.scss");

@Component({
    selector: 'property-input',
    directives: [ComponentCompilerDirective],
    template: `<template *ngIf="dynamicComponentContext" [component-compiler]="dynamicComponentContext">
               </template>`,
})
export class PropertyInputComponent implements OnInit {
    @Input()
    private type: INPUT_PROPERTY_TYPE;

    @Input()
    private model: Object;

    private dynamicComponentContext: DynamicComponentContext<any>;

    constructor(private resolver: ComponentResolver) { }

    ngOnInit(): void {

        let componentToResolve: any = null;

        switch (this.type) {
            //TODO: change this when we have the models
            case "DockerRequirement":
                componentToResolve = DockerInputFormComponent;
                break;
            case "baseCommand":
                componentToResolve = BaseCommandFormComponent;
                break;
        }

        if (componentToResolve !== null) {
            this.resolver.resolveComponent(componentToResolve)
                .then((factory:ComponentFactory<any>) => {
                    this.dynamicComponentContext = new DynamicComponentContext(factory, this.model);
                });
        }
    }
}
