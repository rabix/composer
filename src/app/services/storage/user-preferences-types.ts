export enum ConnectionState {
    Disconnected,
    Connected,
    Connecting,
}

export interface CredentialsEntry {
    url: string;
    hash: string;
    token: string;
    profile: string;
    status: ConnectionState;
    sessionID: string;
    user?: {
        id: string,
        email: string,
        staff: string,
        username: string
        inactive: string,
        superuser: string,
    };
}

