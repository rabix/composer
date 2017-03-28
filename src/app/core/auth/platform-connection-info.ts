export interface PlatformConnectionInfo {
    url: string;
    hash: string;
    token: string;
    profile: string;
    sessionID?: string;

    user?: {
        id: string,
        email: string,
        staff: boolean,
        username: string,
        inactive: boolean,
        superuser: boolean,
    };

}
