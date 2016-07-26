import {Component, OnInit, Input, ComponentResolver, ComponentFactory} from "@angular/core";
import {DynamicComponentContext} from "../../../runtime-compiler/dynamic-component-context";
import {ComponentCompilerDirective} from "../../../runtime-compiler/component-compiler.directive";

require ("./input-form.component.scss");

@Component({
    selector: 'input-form',
    directives: [ComponentCompilerDirective],
    template: `
                <form id="baseCommandForm">
                    <fieldset class="form-group">
                            <a href="#" class="floatRight">Hide</a>
                   
                            <label>{{primaryLabel}}</label>
                            <label class="secondaryLabel">{{secondaryLabel}}</label>
                            
                            <template *ngIf="dynamicComponentContext" [component-compiler]="dynamicComponentContext">
                            </template>
                    </fieldset>
                </form>`,
})
export class InputFromComponent implements OnInit {
    @Input() primaryLabel: string;
    @Input() secondaryLabel: string;
    @Input() contentComponent: any;
    @Input() inputData: any;
    dynamicComponentContext: DynamicComponentContext;

    constructor(private resolver: ComponentResolver) {

    }

    ngOnInit(): void {
        this.resolver.resolveComponent(this.contentComponent)
            .then((factory:ComponentFactory<any>) => {
                this.dynamicComponentContext = new DynamicComponentContext(factory, this.inputData);
            });
    }
}
