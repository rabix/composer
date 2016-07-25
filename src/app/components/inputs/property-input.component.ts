import {Component, OnInit, Input, ComponentResolver, ComponentFactory} from "@angular/core";
import {INPUT_TYPES} from "./types/input-types";
import {DynamicComponentContext} from "../runtime-compiler/dynamic-component-context";
import {DockerInputComponent} from "./types/docker-input.component.ts";
import {ComponentCompilerDirective} from "../runtime-compiler/component-compiler.directive";
import {BaseCommandInput} from "./types/base-command-input.component";

require('./inputs.scss');

@Component({
    selector: 'property-input',
    directives: [ComponentCompilerDirective],
    template: `
                <template *ngIf="dynamicComponentContext" [component-compiler]="dynamicComponentContext">
                </template>`,
})
export class PropertyInput implements OnInit {
    @Input() type: string;
    @Input() model: any;

    dynamicComponentContext: DynamicComponentContext<any>;
    inputTypes: any = INPUT_TYPES;

    constructor(private resolver: ComponentResolver) { }

    ngOnInit(): void {
        let componentToResolve: any = null;

        switch (this.type) {
            //TODO: change the inputTypes when we have the models
            case this.inputTypes.DOCKER_REQUIREMENT:
                componentToResolve = DockerInputComponent;
                break;
            case this.inputTypes.BASE_COMMAND:
                componentToResolve = BaseCommandInput;
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
