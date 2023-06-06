import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { UserRegistrationDto } from "src/dto/user/add.user.dto";
import { ApiResponse } from "src/msci/api.response";
import { User, UserDocument } from "src/schemas/users.schemas";
import * as crypto from 'crypto';
import { UserInfoUpdateDto } from "src/dto/User Info/user.update.info.dto";
import { ArticleService } from "./article.service";
import { ArticleDocument } from "src/schemas/article.schema";
import { async } from "rxjs";


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private articleService: ArticleService
    ) { }

    async findAll(): Promise<UserDocument[]>{
        return this.userModel.find().exec();
    }

    async findOne(id: string): Promise<UserDocument> {
        return this.userModel.findOne({ _id: id }).exec();
    }

    
    async getByEmail(em: string): Promise<UserDocument | null>{
        
        const user = await this.userModel.findOne({ email: em });

        if (user === undefined)
            return null;


        return user;
    }
    
    async deleteUser(id: string): Promise<ApiResponse> {
        let articles: ArticleDocument[] = await this.articleService.getArticlesByUserId(id);
        articles.forEach(async(article, index) => {
          
            let t = await this.articleService.deleteArticle(String(article._id));
            console.log("IDemo", t);
        })
        return new Promise((resolve, reject) => this.userModel
            .findByIdAndRemove({ _id: id })
            .exec()
            .then(res => resolve(new ApiResponse('ok', 0, 'User deleted!')))
            .catch(err => reject(new ApiResponse('error', -1122, err)))
        )
    }
    
    async creat(data: UserRegistrationDto): Promise<UserDocument| ApiResponse >{

        const newUser = new User();
        newUser.email = data.email;
        newUser.forename = data.forename;
        newUser.surname = data.surname;
        newUser.phone = data.phone;

        const passwordHash = crypto.createHash('sha512');

        passwordHash.update(data.password);
        const passwordString = passwordHash.digest('hex').toUpperCase();
        newUser.passwordHash = passwordString;

        let savedUser = await this.userModel.create(newUser);
        
        if (!savedUser) 
            return new ApiResponse('Bad request to create user', -7000, 'New user account cannot be saved!');
           
        return savedUser;
    }

    async updateUserInfo(id:string, data: UserInfoUpdateDto): Promise<UserDocument> {

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordString = passwordHash.digest('hex').toUpperCase();
        // storedUser.passwordHash = passwordString;
        
        return this.userModel.findOneAndUpdate(
            { _id: id },
            {
                email: data.email,
                forename: data.forename,
                surname: data.surname,
                phone: data.phone,
                passwordHash : passwordString,
            },
            {
                new: true
            }
        ).exec();
    }
    
}