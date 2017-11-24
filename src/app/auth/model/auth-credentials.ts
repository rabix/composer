import {User} from "../../../../electron/src/sbg-api-client/interfaces/user";
import {UserPlatformIdentifier} from "./user-platform-identifier";

export class AuthCredentials implements UserPlatformIdentifier {

    static readonly URL_VALIDATION_REGEXP = "^(https:\/\/)(.+)(\.sbgenomics\.com)$";

    static readonly TOKEN_VALIDATION_REGEXP = "^[0-9a-f]{8}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{4}[0-9a-f]{12}$";

    id: string;
    user: User;
    url: string;
    token: string;

    constructor(url: string, token: string, user: User) {
        // this.ensureValidURL(url);
        // this.ensureValidToken(token);

        this.url   = url;
        this.token = token;
        this.user  = user;

        this.id = this.getHash();
    }

    static isValidToken(token: string): boolean {
        return new RegExp(AuthCredentials.TOKEN_VALIDATION_REGEXP).test(token);
    }

    static isValidURL(url: string): boolean {
        return new RegExp(AuthCredentials.URL_VALIDATION_REGEXP).test(url);
    }

    static getSubdomain(url: string): string {
        return url.slice(8, url.length - 15);
    }

    static getPlatformShortName(url: string): string {
        const subdomain = AuthCredentials.getSubdomain(url);
        switch (subdomain) {
            case "api":
                return "SBG";
            case "eu-api":
                return "EU";
            case "cgc-api":
                return "CGC";
            case "pgc-api":
                return "CAVATICA";
            default:
                return subdomain.indexOf("vayu.sbgenomics.com") === -1 ? subdomain : subdomain.split(".")[0];
        }
    }

    static getPlatformLabel(url: string): string {
        const subdomain = AuthCredentials.getSubdomain(url);
        switch (subdomain) {
            case "api":
                return "Seven Bridges";
            case "eu-api":
                return "Seven Bridges (EU)";
            case "cgc-api":
                return "Cancer Genomics Cloud";
            case "pgc-api":
                return "Cavatica";
            default:
                return subdomain.indexOf("vayu.sbgenomics.com") === -1 ? subdomain : subdomain.split(".")[0];
        }
    }

    static from(obj?: UserPlatformIdentifier): AuthCredentials | undefined {
        if (!obj) {
            return undefined;
        }
        return new AuthCredentials(obj.url, obj.token, obj.user);
    }

    /**
     * Checks whether a pair of credentials contain the same user.
     * It differs from the {@link AuthCredentials.equals} method in that x and y can be undefined.
     *
     * @see {@link AuthCredentials.equals} Instance method for comparing equality to another instance
     */
    static isSimilar(x?: AuthCredentials, y?: AuthCredentials): boolean {
        const onlyXExists  = x !== undefined && y === undefined;
        const onlyYExists  = y !== undefined && x === undefined;
        const neitherExist = x === undefined && y === undefined;

        if (onlyXExists || onlyYExists) {
            return false;
        }

        if (neitherExist) {
            return true;
        }

        return x.equals(y);
    }

    getHash(): string {
        const subdomain = AuthCredentials.getSubdomain(this.url);
        return `${subdomain}_${this.user.username}`;
    }

    /**
     * Checks whether given credentials are considered equal to this one.
     * Equality is based on API endpoint and username associated with the token.
     *
     * @see {@link AuthCredentials.isSimilar} Static function for pair comparison
     */
    equals(credentials: AuthCredentials): boolean {
        if (!credentials) {
            return false;
        }

        return this.getHash() === credentials.getHash();
    }

    updateToMatch(credentials: AuthCredentials): void {
        this.url   = credentials.url;
        this.token = credentials.token;
        this.user  = credentials.user;
    }

    private ensureValidToken(token: string): void {
        if (AuthCredentials.isValidToken(token) === false) {
            throw new Error("Given token is not valid: " + token);
        }
    }

    private ensureValidURL(url: string): void {
        if (AuthCredentials.isValidURL(url) === false) {
            throw new Error("Invalid platform URL: " + url);
        }
    }
}
