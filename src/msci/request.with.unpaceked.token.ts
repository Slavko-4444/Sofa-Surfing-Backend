import { JwtDataDto } from "src/dto/authorization/jwt.dto";

declare module 'express' {
    interface Request {
        token: JwtDataDto
    }
}