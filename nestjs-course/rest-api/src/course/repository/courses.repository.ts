import { Course } from './../../../../shared/course';
import { Injectable } from "@nestjs/common";
import {Model} from "mongoose";
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class CoursesRepository {

     constructor() {
        console.log("repo created", this)
    }
    // constructor(@InjectModel('Course') private courseModel: Model<Course>) {
    //     debugger;
    //     console.log("repo created")

    // }
    // async findAll(): Promise<Course[]> {
    //     return this.courseModel.find();

    // }
}