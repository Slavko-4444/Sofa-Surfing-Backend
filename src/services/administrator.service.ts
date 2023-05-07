import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Administrator } from "src/schemas/administrator.schema";



@Injectable()
export class AdministratorService {
    constructor(@InjectModel(Administrator.name) private adminModel: Model<Administrator>) { }

    async findAll(): Promise<Administrator[]>{
        return this.adminModel.find().exec();
    }
}