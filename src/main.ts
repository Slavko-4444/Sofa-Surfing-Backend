import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfiguraion } from 'config/storage.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfiguraion.photo.destination, {
    prefix: StorageConfiguraion.photo.urlPrefix,
    maxAge: StorageConfiguraion.photo.maxAge,
    index: false,
  })
  app.enableCors();

  await app.listen(3000);
}

bootstrap().then(res => { 
  console.log("Listening on port 3000");
});


