import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./app.module";
import {BrowserSystemService} from "./app/platform-providers/browser-system.service";
import {SystemService} from "./app/platform-providers/system.service";

platformBrowserDynamic([
    {provide: SystemService, useClass: BrowserSystemService}
]).bootstrapModule(AppModule).catch(err => console.error(err));
