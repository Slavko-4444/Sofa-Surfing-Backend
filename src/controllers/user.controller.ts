import { Body, Controller, Delete, Get, Param, Post, Patch } from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { UserInfoUpdateDto } from 'src/dto/User Info/user.update.info.dto';
import { UserRegistrationDto } from 'src/dto/user/add.user.dto';
import { UserIdSpecDTO } from 'src/dto/user/user.specf.find.dto';
import { ApiResponse } from 'src/msci/api.response';
import { User, UserDocument } from 'src/schemas/users.schemas';
import { UserService } from "src/services/user.service";

@Controller('api/user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/all')
    async findAllUsers(): Promise<User[]> {
        let c:User[] = await this.userService.findAll();
        return c;
    }

    @Post('registration')
    async Registration(@Body() data: UserRegistrationDto): Promise<User|ApiResponse> {
        
        return await this.userService.creat(data);
    }
    
    @Post('findSpec')
    getUser(@Body() data: UserIdSpecDTO): Promise<User> {    
        return this.userService.findOne(data.id);
    }

    @Delete('specUser/:Id')
    deleteUser(@Param('Id') userId: string): Promise<ApiResponse>{
        return this.userService.deleteUser(userId);
    }

    @Patch('changeUser/:Id')
    async updateUserInfo(@Param('Id') userId: string,@Body() data: UserInfoUpdateDto): Promise<User | ApiResponse> {
  
        const newUserInfo: User = await this.userService.updateUserInfo(userId, data);

        if (!newUserInfo)
            return new ApiResponse('Bad User Info', -5002, 'Neuspjesno promjenjeni licni podaci korisnika!');
        return newUserInfo;
      }
    
    
} 