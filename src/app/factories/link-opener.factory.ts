import {InjectionToken} from "@angular/core";
import {SystemService} from "../platform-providers/system.service";

export const LinkOpenerToken = new InjectionToken("linkOpener");
export type LinkOpener = (href: string, event?: Event) => void;

export const linkOpenerFactory = (native: SystemService) => {
    return (url: string, event?: MouseEvent) => native.openLink(url, event);
};
