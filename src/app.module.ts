import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User, UserSchema } from './schemas/users.schemas';
import { Administrator, AdministratorSchema } from './schemas/administrator.schema';
import { AdministratorService } from './services/administrator.service';
import { AdministratorController } from './controllers/administrator.controller';
import { AuthController } from './controllers/auth.controller';
import { User_token, User_tokenSchema } from './schemas/refresh.token.schema';
import { UserTokenService } from './services/refresh.token.service';
import { AuthMiddleWare } from './middleware/authentication.middleware';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbname: "angular_app"
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Administrator.name, schema: AdministratorSchema },
      { name: User_token.name, schema: User_tokenSchema },
      
    ])
  ],
  controllers: [AdministratorController, UserController, AuthController,],
  providers: [UserService, AdministratorService, UserTokenService],
})
  
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleWare)
      .exclude('auth/*')
      .forRoutes('api/*');
    }
  }
  
