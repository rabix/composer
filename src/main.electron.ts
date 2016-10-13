import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";
import {PlatformProvider} from "./app/platform-providers/platform-provider.abstract";
import {ElectronPlatformProviderService} from "./app/platform-providers/electron.service";

platformBrowserDynamic([
    {provide: PlatformProvider, useClass: ElectronPlatformProviderService}
]).bootstrapModule(AppModule).catch(err => console.error(err));