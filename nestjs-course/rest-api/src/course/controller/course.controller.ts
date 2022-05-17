import { Controller, Get } from "@nestjs/common";
import { findAllCourses } from "../../../db-data";


@Controller()
export class CourseController {
  
  @Get('/api/hello-world')
  async helloWorld(): Promise<string> {
    return "hello World";
  }

  @Get('/api/courses')
  async findCourses(): Promise<any[]> {
    return findAllCourses();
    

  }

}