export class loginAuthoInfo {
    identity: string;
    token: string;
    refreshToken: string;
    expiresAt: string;

    constructor(ident: string, jwt: string, refreshToken: string, expiresAt: string) {
        this.identity = ident;
        this.token = jwt;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
}