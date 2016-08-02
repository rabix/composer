import {Component, OnInit} from "@angular/core";

require("./form.components.scss");

@Component({
    selector: 'docker-input-form',
    template: `
            <form>
                <fieldset class="form-group">
                      <button type="button" class="btn btn-secondary hide-btn">Hide</button>
               
                        <label>Docker image</label>
                        <label class="secondary-label">Docker Repository</label>
                        
                       <input name="dockerPull"
                            type="text"
                            class="form-control"
                            id="dockerImage"
                            [(ngModel)]="dockerPull">
                </fieldset>
            </form>
    `
})
export class DockerInputFormComponent implements OnInit {
    private dockerPull: string;

    ngOnInit(): void {

    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        if (data) {
            this.dockerPull = data.dockerPull ? data.dockerPull : '';
        }
    }
}
