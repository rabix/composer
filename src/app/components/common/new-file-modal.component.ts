import {Component, OnInit} from "@angular/core";
import {
    NgStyle,
    Control,
    ControlGroup,
    Validators,
    FORM_DIRECTIVES,
    FormBuilder,
} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {HttpError, FilePath} from "../../services/api/api-response-types";
import {FileApi} from "../../services/api/file.api";
import * as _ from "lodash";


@Component({
    selector: 'new-file-modal',
    directives: [NgStyle, BlockLoaderComponent, FORM_DIRECTIVES],
    templateUrl: 'app/components/common/new-file-modal.component.html'
})
export class NewFileModalComponent implements OnInit {
    isCreatingFile: boolean;
    showFileExists: boolean;

    name: Control;
    fileType: Control;
    newFileForm: ControlGroup;

    confirm: Function;
    fileTypes: any[];

    selectedType: any;

    constructor(private fileApi: FileApi, private formBuilder: FormBuilder) {
        this.fileTypes = [{
            id: '.json',
            name: 'JSON'
        }, {
            id: '.yaml',
            name: 'YAML'
        }, {
            id: '.js',
            name: 'JavaScript'
        }];

        this.name = new Control('',
            Validators.compose([Validators.required, Validators.minLength(1)])
        );
        this.fileType = new Control(this.fileTypes[0]);

        this.newFileForm = formBuilder.group({
            name: this.name,
            fileType: this.fileType
        });

        //@todo: figure out if there is a better way to set a default value
        this.selectedType = this.fileTypes[0];

        this.name.valueChanges.subscribe(() => {this.showFileExists = false;});
    }

    createFile(form) {
        // turn on loading
        this.isCreatingFile = true;
        let formValue = form.value;

        let fileName = formValue.name;
        //noinspection TypeScriptUnresolvedVariable
        let ext      = formValue.fileType.id;

        // IF: file already has an extension
        if ('.' + _.last(fileName.split('.')) === ext) {
            // remove extension
            fileName = fileName.split('.').slice(0, -1).join('.');
        }

        let filePath = fileName + ext;

        // create file
        this.fileApi.createFile(filePath).subscribe((next: HttpError|FilePath) => {
            this.isCreatingFile = false;

            // IF: file exists
            if ((<HttpError> next).statusCode === 403) {
                // prompt user that file already exists
                this.showFileExists = true;
            } else if (!(<HttpError> next).statusCode) {
                this.confirm(next);
            }
        });
    }

    public ngOnInit() {
    }
}
