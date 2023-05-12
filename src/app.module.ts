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
import { Article, ArticleSchema } from './schemas/article.schema';
import { ArticleService } from './services/article.service';
import { ArticleController } from './controllers/article.controller';
import { ArticleMailerService } from './services/article.confirmation.service';
import { MailerModule } from '@nestjs-modules/mailer'
import { MailConfig } from 'config/mail.config';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017', {
      dbname: "angular_app"
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Administrator.name, schema: AdministratorSchema },
      { name: User_token.name, schema: User_tokenSchema },
      { name: Article.name, schema: ArticleSchema },
      
    ]),
    MailerModule.forRoot({
      transport: {
        host: MailConfig.hostname,
        auth: {
          user: MailConfig.username,
          pass: MailConfig.password,
        }
      }
    })

  ],

  controllers: [AdministratorController, UserController, AuthController, ArticleController, ],
  providers: [UserService, AdministratorService, UserTokenService, ArticleService, ArticleMailerService ],
})
  
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleWare)
      .exclude('auth/*')
      .forRoutes('api/*');
    }
  }
  
