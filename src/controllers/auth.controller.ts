import { Body, Controller, HttpException, HttpStatus, Post, Req } from "@nestjs/common";
import { loginAuthoInfo } from "src/dto/authorization/auth.login.info.dto";
import { JwtDataDto } from "src/dto/authorization/jwt.dto";
import { ApiResponse } from "src/msci/api.response";
import { AdministratorService } from "src/services/administrator.service";
import { UserService } from "src/services/user.service";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import * as crypto from 'crypto';
import { AuthorizationDto } from "src/dto/authorization/auth.dto";
import { Administrator } from "src/schemas/administrator.schema";
import { jwtSecret } from "config/jwt.Secrect";
import { JwtRefreshData } from "src/dto/authorization/jwt.refresh";
import { UserLoginDto } from "src/dto/user/user.login.dto";
import { User } from "src/schemas/users.schemas";
import { User_token } from "src/schemas/refresh.token.schema";
import { UserTokenService } from "src/services/refresh.token.service";
import { UserRefreshTokenDto } from "src/dto/authorization/user.refresh.token.dto";



@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly adminService: AdministratorService,
        private readonly tokenService: UserTokenService
    ) { }

    @Post('login/admin')
    async logInAdmin(@Body() data: AuthorizationDto, @Req() request: Request): Promise<loginAuthoInfo | ApiResponse> {
        
        const admin: Administrator = await this.adminService.getByUsername(data.username);
        if (admin === null)
           return new Promise(resolve => resolve(new ApiResponse('Bad Username', -8001, 'Cannot find admin with given username')));
    
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordString = passwordHash.digest('hex').toUpperCase();

        if (passwordString !== admin.passwordHash) 
            return new Promise(resolve => resolve(new ApiResponse('Bad Password', -8002, 'Bad password!')));
        
    
        const JwtData = new JwtDataDto();
        JwtData.role = "administrator";
        JwtData.identity = admin.username;
        

        JwtData.exp = this.getDatePlus(60 * 60 * 24) * 1000; //token admina traje dan
        JwtData.ip = request.ip;
        JwtData.ua = request.headers["user-agent"].toString();

        const token: string = jwt.sign(JwtData.toPlainObjectJWTdata(),jwtSecret); // generisemo token...

        const responseObject: loginAuthoInfo = new loginAuthoInfo(
            admin.username,
            token,
            "", 
            new Date(JwtData.exp).toLocaleTimeString()
        );
        
        return new Promise(resolve => { resolve(responseObject) });
    }

    @Post('/login/user')
    async UserLogin(@Req() req: Request, @Body() data: UserLoginDto): Promise<loginAuthoInfo | ApiResponse> {

        const lookingUser = await this.userService.getByEmail(data.email);


        if (lookingUser === null)
            return new Promise(resolve => resolve(new ApiResponse('Bad email', -7002, 'Cannot find user with given email')));
    
        
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordString = passwordHash.digest('hex').toUpperCase();

        if (passwordString !== lookingUser.passwordHash) 
            return new Promise(resolve => resolve(new ApiResponse('Bad Password', -7003, 'Bad password!')));
        
        const JwtData = new JwtDataDto();

        JwtData.exp = this.getDatePlus(60 * 5) * 1000; 
        JwtData.ip = req.ip;
        JwtData.ua = req.headers["user-agent"].toString();
        JwtData.role = "user";
        JwtData.identity = lookingUser.email;
        
        const token: string = jwt.sign(JwtData.toPlainObjectJWTdata(), jwtSecret);

        // pravimo refresh token i cuvamo ga u bazu.
        const JwtRefreshDATA = new JwtRefreshData();

        JwtRefreshDATA.identity = JwtData.identity;
        JwtRefreshDATA.role = JwtData.role;
        JwtRefreshDATA.ua = JwtData.ua;
        JwtRefreshDATA.ip = JwtData.ip;
        JwtRefreshDATA.exp = this.getDatePlus(60 * 60) * 1000; // jedan sat traje refreshToken
        
        const refreshToken: string = jwt.sign(JwtRefreshDATA.toPlainObjectJWTdata(), jwtSecret);
        await this.tokenService.addUserToken(lookingUser._id.toString(), refreshToken, new Date(JwtRefreshDATA.exp));

        const responseObject: loginAuthoInfo = new loginAuthoInfo(
            lookingUser._id.toString(),
            token,
            refreshToken,
           new Date(JwtData.exp).toLocaleString()
        );
        
        return responseObject;
    }

    @Post('user/refresh')
    async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto): Promise<loginAuthoInfo | ApiResponse> {

        let userToken: User_token = await this.tokenService.getUserTokenByToken(data.token);

        if (!userToken)
            return new ApiResponse('Bad Refresh Token', -10004, 'No such refresh token.')
        
        let sada = new Date();
        const datumIsteka: Date = userToken.expires_at;
        
        if (datumIsteka.getTime() < sada.getTime()) {
             
            while (datumIsteka.getTime() < sada.getTime()) {
                await this.tokenService.removeUTUserId(userToken.user_id);
                let oldId = userToken.user_id;
                userToken = await this.tokenService.getUserTokenByUserId(oldId);
                if (!userToken)
                    break;
            }

            return new ApiResponse('error', -10006, 'Refresh token is expired')
        }
        
        
        let jwtRefreshData: JwtRefreshData = new JwtRefreshData();
        try {
            jwtRefreshData = jwt.verify(data.token, jwtSecret);
            
        } catch (error) {
            throw new HttpException("Nekorektan token error massage => " + error, HttpStatus.UNAUTHORIZED);
        }
        
        if (!jwtRefreshData)
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
        
        if (req.ip !== jwtRefreshData.ip)
        throw new HttpException('Bad ip address was found', HttpStatus.UNAUTHORIZED);
        
        if (req.headers["user-agent"].toString() !== jwtRefreshData.ua)
        throw new HttpException('Bad user-agent was bad', HttpStatus.UNAUTHORIZED);
        
        const jwtData: JwtDataDto = new JwtDataDto();
        
        jwtData.role     = jwtRefreshData.role;
        jwtData.ip       = jwtRefreshData.ip;
        jwtData.ua       = jwtRefreshData.ua;
        jwtData.identity = jwtRefreshData.identity;
        jwtData.exp      = this.getDatePlus(60 * 5) * 1000;
        
        let NewToken: string = jwt.sign(jwtData.toPlainObjectJWTdata(), jwtSecret);
        

        return new loginAuthoInfo(
            jwtData.identity,
            NewToken,
            data.token,
            new Date(this.getDatePlus(60 * 5) * 1000).toLocaleString()
            );
        }
/** 
 *      Pomocne funkcije :
*/
    private getDatePlus(numberOfSec: number) {
        return new Date().getTime()/ 1000 + numberOfSec;
    }

    private getIsoDate(timestamp: number) {

        const date = new Date();

        date.setTime(timestamp);
        return date.toISOString();
    } 

    private getDataBaseDateFormat(isoFormat: string): string {
        return isoFormat.substr(0, 19).replace('T', ' ');
    }

}