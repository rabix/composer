import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";
// import {HTTP_PROVIDERS} from "@angular/http";
// import {MainComponent} from "./app/components/main/main.component";
// import {disableDeprecatedForms, provideForms} from "@angular/forms";
// import {COMMON_PIPES} from "@angular/common";
//
// /*
//  * Platform and Environment
//  * our providers/directives/pipes
//  */
// export function main(): Promise<any> {
//     return bootstrap(MainComponent, [
//         COMMON_PIPES,
//         HTTP_PROVIDERS,
//         disableDeprecatedForms(),
//         provideForms()
//     ]).catch(err => console.error(err));
// }

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
// document.addEventListener('DOMContentLoaded', () => main());
