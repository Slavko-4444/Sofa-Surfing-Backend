import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AddAdmnistratorDto } from 'src/dto/administrator/administrator.dto';
import { AllowToRoles } from 'src/msci/allow.to.roles.descriptor';
import { ApiResponse } from 'src/msci/api.response';
import { RoleCheckGuard } from 'src/msci/role.check.guard';
import { Administrator } from 'src/schemas/administrator.schema';
import { AdministratorService } from 'src/services/administrator.service';

@Controller('api/admin')
export class AdministratorController {
    constructor(private readonly adminService: AdministratorService) { }

    @Get()
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator')
    async findAllUsers(): Promise<Administrator[]> {
        return await this.adminService.findAll();
    }
    
    @Post('registration')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator')
    async Registration(@Body() data: AddAdmnistratorDto): Promise<Administrator | ApiResponse> {
        return await this.adminService.createAdmin(data);
    }
    
    @Delete('deletingAdmin/:Id')
    @UseGuards(RoleCheckGuard)
    @AllowToRoles('administrator')
    deleteUser(@Param('Id') adminId: string): Promise<ApiResponse>{
        return this.adminService.deleteAdmin(adminId);
    }
    
}