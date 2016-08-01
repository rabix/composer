import {Component, OnInit, Input, ComponentResolver, ComponentFactory} from "@angular/core";
import {INPUT_TYPES} from "./types/input-types";
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
    private type: string;

    @Input()
    private model: any;

    private dynamicComponentContext: DynamicComponentContext<any>;
    private inputTypes: any = INPUT_TYPES;

    constructor(private resolver: ComponentResolver) { }

    ngOnInit(): void {
        let componentToResolve: any = null;

        switch (this.type) {
            //TODO: change this when we have the models
            case this.inputTypes.DOCKER_REQUIREMENT:
                componentToResolve = DockerInputFormComponent;
                break;
            case this.inputTypes.BASE_COMMAND:
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
