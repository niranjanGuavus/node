import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from 'shared/course';


@Injectable()
export class CourseService {

    constructor(@InjectModel('angCourse') private courseModel: Model<Course>){
    }

    async addCourse(course: Partial<Course>): Promise<Course>{
        const newCourse = new this.courseModel(course);
        await newCourse.save();

       //return this.courseModel.create(course);
       return newCourse.toObject({versionKey: false});
    }

    async findAll(): Promise<Course[]> {
        return this.courseModel.find().limit(2).exec();
    }

    async updateCourse(courseId:string, changes: Partial<Course>): Promise<Course> {
        return this.courseModel.findOneAndUpdate(
            {_id: courseId}, 
            changes,
            {new: true}
            );

    }

    async deleteCourse(courseId:string) {
        return this.courseModel.deleteOne({_id:courseId});

    }
}
