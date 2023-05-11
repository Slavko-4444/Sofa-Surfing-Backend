import { NestMiddleware, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtDataDto } from "src/dto/authorization/jwt.dto";
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from "config/jwt.Secrect";
import { AdministratorService } from "src/services/administrator.service";
import { UserService } from "src/services/user.service";


@Injectable()
export class AuthMiddleWare implements NestMiddleware {

    constructor(private adminisistrationService: AdministratorService, private userService: UserService)
    { }
    async use(req: Request, res: Response, next: NextFunction) {
       
        if (!req.headers.authorization)
            throw new HttpException('Token not Found', HttpStatus.UNAUTHORIZED);
        
        let TokenParts = req.headers.authorization.split(' ');
        const token = TokenParts[1];

        let jwtData: JwtDataDto = new JwtDataDto();
        try {
            jwtData = jwt.verify(token, jwtSecret);
        } catch (error) {
            throw new HttpException("Nekorektan token => " + error + " <=> " , HttpStatus.UNAUTHORIZED);
        }

        if (!jwtData)
            throw new HttpException('Bad token found, fix it ', HttpStatus.UNAUTHORIZED);
        
        if (req.ip !== jwtData.ip)
        throw new HttpException('Bad ip address was found', HttpStatus.UNAUTHORIZED);
        
        if (req.headers["user-agent"].toString() !== jwtData.ua)
            throw new HttpException('Bad user-agent was bad', HttpStatus.UNAUTHORIZED);
    
        if (jwtData.role === "administrator") {
            const administrator = await this.adminisistrationService.getByUsername(jwtData.identity);
            if (!administrator) 
                throw new HttpException('This account cannot be found.', HttpStatus.UNAUTHORIZED);
            }
            else if (jwtData.role === "user") {
                const user = await this.userService.getByEmail(jwtData.identity);
                if (!user) 
                    throw new HttpException('This account cannot be found.', HttpStatus.UNAUTHORIZED);
        }

        let sad = new Date();
        let bilo = new Date(jwtData.exp);
        if (bilo < sad) {
            throw new HttpException('Token has expired!', HttpStatus.UNAUTHORIZED);
        }

        req.token = jwtData; // proslijedjujemo otpakovan token u requestu  
        next();
    }

}