import {User} from "../../../../electron/src/sbg-api-client/interfaces/user";

export interface UserPlatformIdentifier {
    user: User;
    id: string;
    url: string;
    token: string;
}
