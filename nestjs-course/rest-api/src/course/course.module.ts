import { Module } from "@nestjs/common";
import { CourseController } from "./controller/course.controller";

@Module({
  controllers: [
    CourseController
  ]

})
export class CourseModule {

}