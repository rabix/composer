import {Component, OnInit, OnDestroy} from "@angular/core";
import {ExpressionInputComponent} from "../../../editor-common/components/expression-input/expression-input.component";
import {InputSidebarService, InputInspectorData} from "../../../services/sidebars/input-sidebar.service";
import {FormControl} from "@angular/forms";
import {ComponentBase} from "../../common/component-base";
import {BasicInputSectionComponent} from "../../../tool-editor/object-inspector/basic-section/basic-input-section.component";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        BasicInputSectionComponent
    ],
    template: `
            <form class="input-inspector-component object-inspector" *ngIf="basicInputSectionControl">
                <div>
                    <span class="input-text">Input</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <basic-input-section [formControl]="basicInputSectionControl"
                                     [context]="context">
                </basic-input-section>
            </form>
    `
})
export class InputInspectorComponent extends ComponentBase implements OnInit, OnDestroy {
    private context: any;

    private basicInputSectionControl: FormControl;

    constructor(private inputSidebarService: InputSidebarService) {
        super();
    }

    ngOnInit(): void {
        this.tracked = this.inputSidebarService.inputPortDataStream.subscribe((data: InputInspectorData) => {
            this.context = data.context;
            this.basicInputSectionControl = new FormControl(data.inputProperty);
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
