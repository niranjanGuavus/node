import { Module } from "@nestjs/common";
import { CourseModule } from "./course/course.module";
import {MongooseModule} from '@nestjs/mongoose';
import { MONGO_CONNECTION } from "./constants";
import { CoursesRepository } from "./course/repository/courses.repository";

@Module({
  imports: [
    CourseModule,
    MongooseModule.forRoot(MONGO_CONNECTION, {
      useNewUrlParser: true,
    }),
    
  ],

})
export class AppModule {

}