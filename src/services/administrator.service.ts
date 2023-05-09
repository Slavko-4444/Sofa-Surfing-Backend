import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddAdmnistratorDto } from "src/dto/administrator/administrator.dto";
import { ApiResponse } from "src/msci/api.response";
import { Administrator } from "src/schemas/administrator.schema";
import * as crypto from 'crypto';



@Injectable()
export class AdministratorService {
    constructor(@InjectModel(Administrator.name) private adminModel: Model<Administrator>) { }

    async findAll(): Promise<Administrator[]>{
        return this.adminModel.find().exec();
    }

    async createAdmin(data: AddAdmnistratorDto): Promise<Administrator | ApiResponse> {

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordString = passwordHash.digest('hex').toUpperCase();

        const savedAdmin = await this.adminModel.create({
            username: data.username,
            passwordHash: passwordString
        });

        if (!savedAdmin)
            return new ApiResponse('Bad request to create admin', -7001, 'New admin account cannot be saved!');

        return savedAdmin;
    }

    async getByUsername(un: string): Promise<Administrator | null>{
        
        const admin = await this.adminModel.findOne({ username: un });

        if (admin === undefined)
            return null;
            
        return admin;
    }

    async deleteAdmin(id: string): Promise<ApiResponse>{
        
        return new Promise((resolve, reject) => this.adminModel
        .findByIdAndRemove({ _id: id })
        .exec()
        .then(res => resolve(new ApiResponse('ok', 0, 'Administrator deleted!')))
        .catch(err => reject(new ApiResponse('error', -1123, err)))
    )
    }


}