import {Component} from "@angular/core";
import {FormBuilder, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormGroup} from "@angular/forms";
@Component({
    selector: `ct-blank-file-form`,
    directives: [FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES]
})
export class BlankFileFormComponent {

    private form: FormGroup;

    public constructor(private builder: FormBuilder) {
        this.form = builder.group({
            name: [""],
            extension: [".json"]
        });
    }

    public onSubmit(){
        console.debug("Submitting", arguments);
    }
}
