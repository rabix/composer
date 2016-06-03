/*
 * Providers provided by Angular
 */
import {bootstrap} from "@angular/platform-browser-dynamic";
import {HTTP_PROVIDERS} from "@angular/http";
import {MainComponent} from "./app/components/main/main.component";
import {COMMON_PIPES, FORM_DIRECTIVES, NG_VALIDATORS, NG_ASYNC_VALIDATORS} from "@angular/common";
import {ModalBuilder} from "./app/components/modal/builders/modal.builder.ts";
import {provideStore} from "@ngrx/store";
import {runEffects} from "@ngrx/effects";
import {FileEffects} from "./app/store/effects/file.effects";
import {REDUCERS} from "./app/store/index";
import {provide} from "@angular/core";
/*
 * Platform and Environment
 * our providers/directives/pipes
 */

export function main(): Promise<any> {
    return bootstrap(MainComponent, [
        COMMON_PIPES,
        FORM_DIRECTIVES,
        HTTP_PROVIDERS,
        ModalBuilder,
        provideStore(REDUCERS)
    ]).catch(err => console.error(err));
}

if ('development' === ENV && HMR === true) {
    // activate hot module reload
    let ngHmr = require('angular2-hmr');
    ngHmr.hotModuleReplacement(main, module);
} else {
    // bootstrap when documetn is ready
    document.addEventListener('DOMContentLoaded', () => main());
}
