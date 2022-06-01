import { Injectable } from '@nestjs/common';
//import { InjectModel } from '@nestjs/mongoose';
//import { Model } from 'mongoose';
//import { Course, CourseDocument } from '../course/schemas/course.schema';

@Injectable()
export class NfloadService {
    
    // constructor(@InjectModel('course') private courseModel: Model<CourseDocument>){
    // }

    // async findAll(): Promise<Course[]> {
    //     return this.courseModel.find().exec();
    // }
}
