import {Component, OnInit, OnDestroy} from "@angular/core";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService, InputInspectorData} from "../../../services/sidebars/input-sidebar.service";
import {BasicInputSectionComponent} from "./basic-section/basic-input-section.component";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        BasicInputSectionComponent
    ],
    template: `
            <form class="input-inspector-component object-inspector" *ngIf="selectedProperty">
                <div>
                    <span class="input-text">Input</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <basic-input-section [selectedProperty]="selectedProperty"
                                     [context]="context"></basic-input-section>
            </form>
    `
})
export class InputInspectorComponent implements OnInit, OnDestroy {

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    private subs: Subscription[] = [];

    private context: any;

    constructor(private inputSidebarService: InputSidebarService) { }

    ngOnInit(): void {
        this.subs.push(
            this.inputSidebarService.inputPortDataStream.subscribe((data: InputInspectorData) => {
                this.selectedProperty = data.inputProperty;
                this.context = data.context;
            })
        );
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
