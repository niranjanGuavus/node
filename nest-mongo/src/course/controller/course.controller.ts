import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Course } from 'shared/course';
import { CourseService } from '../service/course.service';

@Controller('courses')
export class CourseController {

    constructor(private service: CourseService) {

    }
    @Post()
    async createCourse(@Body() course:Partial<Course>): Promise<Course> {
        console.log("Creating new course ")
        return this.service.addCourse(course);
    }

    @Get()
    async findCourses(): Promise<Course[]> {
        return this.service.findAll()
    }

    @Put(':courseId')
    async updateCourse(@Param('courseId') courseId: string, @Body() changes: Partial<Course>): Promise<Course> {
        console.log('updating course');
       return  this.service.updateCourse(courseId, changes);
    }

    @Delete(':courseId')
    async deleteCourse(@Param('courseId') courseId: string){

        console.log('deleting course');
        this.service.deleteCourse(courseId);
    }
}
