import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchema } from './schemas/users.schemas';
import { Administrator, AdministratorSchema } from './schemas/administrator.schema';
import { AdministratorService } from './services/administrator.service';
import { AdministratorController } from './controllers/administrator.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbname: "angular_app"
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Administrator.name, schema: AdministratorSchema },
    ])
  ],
  controllers: [
    UserController,
    AdministratorController,
  ],
  providers: [
    UserService,
    AdministratorService,
    
  ], 
})
  
export class AppModule {}
