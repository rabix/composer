import {Component, OnInit} from "@angular/core";

@Component({
    selector: 'docker-input',
    template: `
         <input name="dockerPull"
                type="text"
                class="form-control"
                id="dockerImage"
                [(ngModel)]="dockerPull">
    `,
})
export class DockerInput implements OnInit {
    dockerPull: string;

    constructor() { }

    ngOnInit(): any {

    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        if (data) {
            this.dockerPull = data.dockerPull ? data.dockerPull : null;
        }
    }

}
