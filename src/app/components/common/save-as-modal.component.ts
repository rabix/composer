import {Component, OnInit} from "@angular/core";
import {
    NgStyle,
    Control,
    ControlGroup,
    Validators,
    FORM_DIRECTIVES,
    FormBuilder
} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Store} from "@ngrx/store";
import * as ACTIONS from "../../store/actions";
import {FileEffects} from "../../store/effects/file.effects";
import {FileApi} from "../../services/api/file.api";

@Component({
    selector: 'new-file-modal',
    directives: [NgStyle, BlockLoaderComponent, FORM_DIRECTIVES],
    templateUrl: 'app/components/common/save-as-modal.component.html'
})
export class SaveAsModalComponent implements OnInit {
    private isCreatingFile: boolean;
    private showFileExists: boolean;
    private isGeneralError: boolean;

    private name: Control;
    private newFileForm: ControlGroup;

    private confirm: Function;
    private model: any;

    constructor(private formBuilder: FormBuilder,
                private store: Store<any>,
                private fileFx: FileEffects,
                private fileApi: FileApi) {

        this.fileFx.copyFile$.subscribe(this.store);

        this.name = new Control('',
            Validators.compose([Validators.required, Validators.minLength(1)])
        );

        this.newFileForm = formBuilder.group({
            name: this.name,
        });

        this.name.valueChanges.subscribe(() => {
            this.showFileExists = false;
            this.isGeneralError = false;
        });
    }

    createFile(form) {
        // turn on loading
        this.isCreatingFile = true;
        let formValue       = form.value;
        let filePath        = formValue.name;

        this.isCreatingFile = true;


        this.fileApi.createFile(filePath, this.model.content).subscribe((file) => {
            this.isCreatingFile = false;
            this.store.dispatch({type: ACTIONS.OPEN_FILE_REQUEST, payload: file});
            this.confirm(file);
        }, (error) => {
            this.isCreatingFile = false;
            if (error.statusCode === 403) {
                this.showFileExists = true;
            } else {
                this.isGeneralError = true;
            }
        });
        // this.store.dispatch({
        //     type: ACTIONS.COPY_FILE_REQUEST, payload: {
        //         path: filePath,
        //         content: this.model.content
        //     }
        // });


        // this.store.select("newFile").subscribe((file) => {
        //     if (file && file.path === filePath) {
        //         this.isCreatingFile = false;
        //         this.store.dispatch({type: ACTIONS.OPEN_FILE_REQUEST, payload: file.model});
        //         this.confirm(file.model);
        //     }
        // });
        //
        // // Handle error if file already exists
        // this.store.select("globalErrors").subscribe((error) => {
        //     if (error && error.path === filePath) {
        //         this.isCreatingFile = false;
        //
        //         if (error.error.statusCode === 403) {
        //             this.showFileExists = true;
        //         } else {
        //             this.isGeneralError = true;
        //         }
        //     }
        // });
    }

    public ngOnInit() {
    }
}
