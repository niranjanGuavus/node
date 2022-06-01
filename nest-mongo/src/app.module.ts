import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MONGO_CONNECTION } from './constants';
import { NfloadModule } from './nfload/nfload.module';
import { SliceloadModule } from './sliceload/sliceload.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_CONNECTION),
    NfloadModule, SliceloadModule, CourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
