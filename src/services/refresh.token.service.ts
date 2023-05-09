import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiResponse } from "src/msci/api.response";
import * as crypto from 'crypto';
import { UserTokenDocument, User_token } from "src/schemas/refresh.token.schema";


@Injectable()
export class UserTokenService {

    constructor(@InjectModel(User_token.name) private tokenModel: Model<User_token>) { }

    async addUserToken(userId: string, refreshToken: string, exp: Date) {
        
        const token = await this.tokenModel.create({
            expires_at: exp,
            token: refreshToken,
            user_id: userId
        });
    }

    getUserTokenByToken(token:string): Promise<UserTokenDocument> {
        return this.tokenModel.findOne({token: token}).exec();
    }

    getUserTokenByUserId(Id:string): Promise<UserTokenDocument> {
        return this.tokenModel.findOne({user_id: Id}).exec();
    }

    
    async removeUToken(token: string) {
        await this.tokenModel.deleteOne({token: token})
    }
    async removeUTUserId(Id: string) {
        await this.tokenModel.deleteOne({user_id: Id})
    }
}