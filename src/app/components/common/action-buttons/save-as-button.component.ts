import {Component, Input, Injector, ComponentFactory, ComponentResolver} from "@angular/core";
import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent} from "../../modal/modal.component";
import {BehaviorSubject} from "rxjs/Rx";
import {SaveAsModalComponent} from "../save-as-modal.component";
import {FileModel} from "../../../store/models/fs.models";
import {ModalData} from "../../../models/modal.data.model";
import {DynamicComponentContext} from "../../runtime-compiler/dynamic-component-context";

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
    model: BehaviorSubject<string>;

    constructor(private modal: ModalComponent,
                private injector: Injector,
                private resolver: ComponentResolver) {
    }

    /**
     * Opens new file modal
     */
    openModal(): void {
        // result should just be final result, like file to open
        this.modal.show();
    }

    ngAfterViewInit() {
        this.model = new BehaviorSubject(null);
        this.content.map((file: FileModel) => file.content).subscribe(this.model);

        this.initModal();
    }

    initModal() {
        let _self = this;

        this.resolver.resolveComponent(SaveAsModalComponent)
            .then((factory: ComponentFactory<any>)=> {

                let modalData = new ModalData({
                    functions: {
                        cancel: function() {
                            this.cref.destroy();
                            this.result.resolve();
                        },
                        confirm: function(data) {
                            this.cref.destroy();
                            this.result.resolve(data);
                        }
                    },
                    model: _self.model
                });

                this.modal.injector = this.injector;
                this.modal.dynamicComponentContext = new DynamicComponentContext(factory, modalData);
            });
    }
}
