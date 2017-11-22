import {Component, Input, OnInit, ViewContainerRef, ViewEncapsulation} from "@angular/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {LoginService} from "../services/login/login.service";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "logout",
    template: `
        <button class="btn btn-primary" (click)="logout()">Logout</button>
    `,
    styleUrls: []
})
export class LogoutComponent {

    constructor(private _loginService: LoginService) {}

    logout(): void {
        this._loginService.logout("api_token");
    }

}