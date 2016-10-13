import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";
import {PlatformProvider} from "./app/platform-providers/platform-provider.abstract";
import {BrowserPlatformProviderService} from "./app/platform-providers/browser.service";

platformBrowserDynamic([
    {provide: PlatformProvider, useClass: BrowserPlatformProviderService}
]).bootstrapModule(AppModule).catch(err => console.error(err));