
export enum ConnectionState {
    Disconnected,
    Connected,
    Connecting,
}

export interface CredentialsEntry {
    profile?: string; // @TODO: Remove when refactoring to public api
    subdomain?: string;
    url: string;
    hash: string;
    token: string;
    status: ConnectionState;
    sessionID?: string;
}

