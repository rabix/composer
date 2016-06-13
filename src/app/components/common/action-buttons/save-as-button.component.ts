import {Component, Input, Injector, ComponentFactory, ComponentResolver} from "@angular/core";
import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent} from "../../modal/modal.component";
import {BehaviorSubject} from "rxjs/Rx";
import {SaveAsModalComponent} from "../save-as-modal.component";
import {FileModel} from "../../../store/models/fs.models";

@Component({
    selector: 'save-as-button',
    template: `
        <action-button class="nav-link" 
                        title="Save As" 
                        iconClass="fa fa-save fa-lg"
                        (click)="openModal()">
        </action-button>
    `,
    providers: [ModalComponent],
    directives: [ActionButtonComponent]
})
export class SaveAsButtonComponent {
    @Input() content: BehaviorSubject<FileModel>;

    constructor(private modal: ModalComponent,
                private injector: Injector,
                private resolver: ComponentResolver) {

    }

    /**
     * Opens new file modal
     */
    openModal(): void {
        this.modal.data = {
            content: this.content.value.content
        };

        // result should just be final result, like file to open
        this.modal.show();
    }

    ngAfterViewInit() {
        this.initModal();
    }

    initModal() {

        this.resolver.resolveComponent(SaveAsModalComponent)
            .then((factory: ComponentFactory)=> {
                this.modal.factory = factory;
            });

        // so the modalComponent can resolve dependencies in the same tree
        // as the component initiating it
        this.modal.injector = this.injector;

        this.modal.functions = {
            cancel: function () {
                this.cref.destroy();
                // By rejecting, the show must catch the error. So by resolving,
                // it can be ignored silently in case the result is unimportant.
                this.result.resolve();
            },
            confirm: function (data) {
                this.cref.destroy();
                this.result.resolve(data);
            }
        };

    }
}
