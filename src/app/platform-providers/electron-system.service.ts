import {Injectable} from "@angular/core";
import {SystemService} from "./system.service";

const {shell} = window["require"]("electron");

@Injectable()
export class ElectronSystemService extends SystemService {

    public openLink(url: string) {
        shell.openExternal(url);
    }
}
