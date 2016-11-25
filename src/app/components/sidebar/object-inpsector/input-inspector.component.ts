import {Component, OnInit, OnDestroy} from "@angular/core";
import {ExpressionInputComponent} from "../../../editor-common/components/expression-input/expression-input.component";
import {InputSidebarService, InputInspectorData} from "../../../services/sidebars/input-sidebar.service";
import {FormControl} from "@angular/forms";
import {ComponentBase} from "../../common/component-base";
import {BasicInputSectionComponent} from "../../../tool-editor/object-inspector/basic-section/basic-input-section.component";
import {InputDescriptionComponent} from "../../../tool-editor/object-inspector/input-description/input-description.component";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        BasicInputSectionComponent,
        InputDescriptionComponent
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
                
                <input-description [formControl]="descriptionForm"></input-description>
            </form>
    `
})
export class InputInspectorComponent extends ComponentBase implements OnInit, OnDestroy {
    private context: any;

    private basicInputSectionControl: FormControl;

    private descriptionForm: FormControl;

    constructor(private inputSidebarService: InputSidebarService) {
        super();
    }

    ngOnInit(): void {
        this.tracked = this.inputSidebarService.inputPortDataStream.subscribe((data: InputInspectorData) => {
            this.context = data.context;
            this.basicInputSectionControl = new FormControl(data.inputProperty);
            this.descriptionForm = new FormControl(data.inputProperty);

            this.basicInputSectionControl.valueChanges.subscribe(value => {
                console.log(data.inputProperty);
            });

            this.descriptionForm.valueChanges.subscribe(value => {
                console.log(data.inputProperty);
            });
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
