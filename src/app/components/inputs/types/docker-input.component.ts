import {Component, OnInit} from "@angular/core";

@Component({
    selector: 'docker-input',
    template: `
                <form>
                    <fieldset class="form-group">
                            <a href="#" class="floatRight">Hide</a>
                   
                            <label for="dockerImage">Docker image</label>
                            <label for="dockerImage" class="secondaryLabel">Docker Repository</label>
                            
                            <input type="text" class="form-control" id="dockerImage" [(ngModel)]="dockerPull">
                    </fieldset>
                </form>`,
})
export class DockerInputComponent implements OnInit {
    dockerPull: string;

    constructor() {}

    ngOnInit(): any {

    }

    /*TODO: use actual model type here*/
    public setState(data: any) {
        if (data) {
            this.dockerPull = data.dockerPull ? data.dockerPull : null;
        }
    }

}
