import {Injectable} from "@angular/core";
import {EventHubService} from "../event-hub/event-hub.service";

@Injectable()
export class EventMonitors {

    constructor(private hub: EventHubService) {

        this.hub.getStream().subscribe(event => {
        });

    }


}
