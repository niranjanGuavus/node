import { Controller, Get } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Course } from "../../../../shared/course";
import { findAllCourses } from "../../../db-data";
import { CoursesRepository } from "../repository/courses.repository";


@Controller()
export class CourseController {

  // constructor(private coursesDB:CoursesRepository) {
  //   console.log("controller created", this.coursesDB);
  // }
  constructor(@InjectModel('Course') private courseModel: Model <Course>) {
    console.log("controller created");

  }
  
  
  @Get('/api/hello-world')
  async helloWorld(): Promise<string> {
    return "hello World";
  }

  // it is for local data
  // @Get('/api/courses')
  // async findCourses(): Promise<any[]> {
  //   debugger;
  //   return findAllCourses();
  // }

  // @Get('/api/courses')
  // async findCourses(): Promise<Course[]> {
  //   debugger;
  //   try {
  //     return this.coursesDB.findAll()
  //   } catch(e){
  //     console.log(e)
  //   }
  // }

  @Get('/api/courses')
  async findCourses(): Promise<Course[]> {
      return this.courseModel.find();
  }
}