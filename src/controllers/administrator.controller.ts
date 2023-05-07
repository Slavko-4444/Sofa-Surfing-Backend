import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Administrator } from 'src/schemas/administrator.schema';
import { AdministratorService } from 'src/services/administrator.service';

@Controller('api/admin')
export class AdministratorController {
    constructor(private readonly adminService: AdministratorService) { }

    @Get()
    async findAllUsers(): Promise<Administrator[]> {
        return await this.adminService.findAll();
    }
}