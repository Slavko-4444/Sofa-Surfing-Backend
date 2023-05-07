import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/schemas/users.schemas';
import { UserService } from "src/services/user.service";

@Controller('api/user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async findAllUsers(): Promise<User[]> {
        return await this.userService.findAll();
    }
}