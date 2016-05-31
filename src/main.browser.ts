/*
 * Providers provided by Angular
 */
import {bootstrap} from "@angular/platform-browser-dynamic";
import {HTTP_PROVIDERS} from "@angular/http";
import {MainComponent} from "./app/components/main/main.component";
import {COMMON_PIPES} from "@angular/common";
import {ModalBuilder} from "./app/components/modal/builders/modal.builder.ts";
/*
 * Platform and Environment
 * our providers/directives/pipes
 */

export function main(): Promise<any> {
    return bootstrap(MainComponent, [HTTP_PROVIDERS, COMMON_PIPES, ModalBuilder]).catch(err => console.error(err));
}

if ('development' === ENV && HMR === true) {
    // activate hot module reload
    let ngHmr = require('angular2-hmr');
    ngHmr.hotModuleReplacement(main, module);
} else {
    // bootstrap when documetn is ready
    document.addEventListener('DOMContentLoaded', () => main());
}
