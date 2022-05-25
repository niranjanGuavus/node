import { CoursesRepository } from './repository/courses.repository';
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CourseController } from "./controller/course.controller";
import { CoursesSchema } from "./schemas/courses.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name:"Course", schema: CoursesSchema
      }
    ])
  ],
  controllers: [CourseController],
  providers: [CoursesRepository],

})
export class CourseModule {

}