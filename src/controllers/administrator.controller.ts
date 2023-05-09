import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AddAdmnistratorDto } from 'src/dto/administrator/administrator.dto';
import { ApiResponse } from 'src/msci/api.response';
import { Administrator } from 'src/schemas/administrator.schema';
import { AdministratorService } from 'src/services/administrator.service';

@Controller('api/admin')
export class AdministratorController {
    constructor(private readonly adminService: AdministratorService) { }

    @Get()
    async findAllUsers(): Promise<Administrator[]> {
        return await this.adminService.findAll();
    }

    @Post('registration')
    async Registration(@Body() data: AddAdmnistratorDto): Promise<Administrator | ApiResponse> {
        return await this.adminService.createAdmin(data);
    }

    @Delete('deletingAdmin/:Id')
    deleteUser(@Param('Id') adminId: string): Promise<ApiResponse>{
        return this.adminService.deleteAdmin(adminId);
    }
    
}