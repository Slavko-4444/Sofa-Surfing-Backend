
export class JwtDataDto { 
    role: "administrator" | "user";
    identity: string;
    exp: number;
    ip: string;
    ua: string;

    toPlainObjectJWTdata() {
        return {
            role: this.role,
            identity: this.identity, 
            exp: this.exp,
            ip: this.ip,
            ua: this.ua
        }
    }
}
