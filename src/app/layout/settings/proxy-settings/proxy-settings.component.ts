import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {debounceTime, take} from "rxjs/operators";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ProxySettings} from "../../../../../electron/src/storage/types/proxy-settings";

@Component({
    selector: "ct-proxy-settings",
    styleUrls: ["./proxy-settings.component.scss"],
    template: `

        <form [formGroup]="form" *ngIf="form">
            <div class="form-check">

                <!--Use Proxy Server-->
                <div class="form-group flex-container">
                    <label class="form-control-label">Use Proxy Server
                    </label>
                    <span class="align-right">
                        <ct-toggle-slider formControlName="useProxy"
                                          name="useProxy">
                                          [on]="'Yes'"
                                          [off]="'No'">
                        </ct-toggle-slider>
                    </span>
                </div>

                <!--Proxy Server Settings-->
                <div class="form-group proxy-options-wrapper" *ngIf="form.get('useProxy').value">

                    <!--HTTP Proxy Server-->
                    <div class="form-group" [class.has-warning]="form.get('server').invalid">
                        <label> HTTP proxy server:
                        </label>
                        <input class="form-control" type="text" formControlName="server" name="server"/>
                        <span class="text-warning" *ngIf="form.get('server').errors">
                            <i class="fa fa-exclamation-circle fa-fw"></i>
                            <span>Proxy server should start with http|https</span>
                        </span>
                    </div>

                    <!--Port-->
                    <div class="form-group" [class.has-warning]="form.get('port').invalid">
                        <label>Port:</label>
                        <input class="form-control"
                               type="number" min="0" max="65535" formControlName="port"
                               name="port"/>
                        <span class="text-warning" *ngIf="form.get('port').errors">
                            <i class="fa fa-exclamation-circle fa-fw"></i>
                            <span>Port number should be 0-65535</span>
                        </span>
                    </div>
                </div>

                <!--Use proxy server basic authentication-->
                <div class="form-group flex-container" *ngIf="form.get('useProxy').value">
                    <label class="form-control-label">Use Proxy Server Basic Authentication</label>
                    <span class="align-right">
                        <ct-toggle-slider formControlName="useAuth"
                                          name="auth">
                                          [on]="'Yes'"
                                          [off]="'No'">
                        </ct-toggle-slider>
                        </span>
                </div>

                <!--Basic Authentication Settings-->
                <div class="form-group proxy-options-wrapper" *ngIf="form.get('useProxy').value">
                    <div *ngIf="form.get('useAuth').value">

                        <!--Username-->
                        <div class="form-group" [class.has-warning]="form.get('username').invalid">
                            <label>Username:</label>
                            <input class="form-control" type="text" formControlName="username" name="username"/>
                        </div>

                        <!--Password-->
                        <div class="form-group" [class.has-warning]="form.get('password').invalid">
                            <label>Password:</label>
                            <input class="form-control" type="password" formControlName="password" name="password"/>
                        </div>
                    </div>
                </div>
            </div>

        </form>
    `,
})
export class ProxySettingsComponent extends DirectiveBase implements OnInit {

    form: FormGroup;


    constructor(private localRepository: LocalRepositoryService) {
        super();
    }

    ngOnInit() {

        this.localRepository.getProxySettings().pipe(
            take(1)
        ).subscribeTracked(this, (proxySettings: ProxySettings) => {
            this.form = new FormGroup({
                useProxy: new FormControl(proxySettings.useProxy),
                server: new FormControl(proxySettings.server, [Validators.pattern("^(http|https):\\/\\/.*")]),
                port: new FormControl(proxySettings.port, [Validators.min(0), Validators.max(65535)]),
                useAuth: new FormControl(proxySettings.useAuth),
                username: new FormControl(proxySettings.username),
                password: new FormControl(proxySettings.password)
            });

            this.form.valueChanges.pipe(
                debounceTime(500)
            ).subscribeTracked(this, () => {
                this.localRepository.setProxySettings(this.form.getRawValue()).then(() => {
                }, (e) => {
                    console.warn("Setting proxy error", e);
                })
            });

        });
    }
}


