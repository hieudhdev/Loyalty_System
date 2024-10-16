import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppDataSource } from './database/configs/database.config';
import * as cookieParser from 'cookie-parser';

const app_port = process.env.PORT || 8080

async function bootstrap() {
  // init app
  const app = await NestFactory.create(AppModule);

  // Cookies config
  app.use(cookieParser());
  
  // connect DB
  await AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
      console.error("Error during Data Source initialization", err)
  })

  // CORS config
  app.enableCors({
    origin: 'http://localhost:4000', 
    credentials: true,
  });

  // Data validations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(app_port, () => {
    console.log(`App is listening on port ${app_port}!`);
  });
}
bootstrap();
