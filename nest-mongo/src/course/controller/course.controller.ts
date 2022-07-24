import { BadRequestException, Body, Controller, Delete, Get, HttpException, Param, Post, Put, UseFilters } from '@nestjs/common';
import { Course } from 'shared/course';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { ToIntegerPipe } from 'src/pipe/to-integer.pipe';
import { CourseService } from '../service/course.service';

@Controller('courses')
/**
 * Note: the filter can be used over api or over controller or in app level.. not it moves to app level.
 */
//@UseFilters(new HttpExceptionFilter()) 
export class CourseController {

    constructor(private service: CourseService) {

    }
    @Post()
    async createCourse(@Body() course: Partial<Course>): Promise<Course> {
        console.log("Creating new course ")
        return this.service.addCourse(course);
    }

    @Get()
    async findCourses(): Promise<Course[]> {
        return this.service.findAll()
    }

    @Put(':courseId')// this course id is appded at end f the url
    async updateCourse(@Param('courseId') courseId: string,
        @Body("seqNo", ToIntegerPipe) seqNo: number,
        @Body() changes: Partial<Course>): Promise<Course> {
        console.log('updating course');
        console.log("seqNo value "+ seqNo + ", type: "+typeof seqNo);
        // add error if we are going to over write the course id because update should not do against the id.
        if (changes._id) {
            //throw new HttpException(" can't update the course Id", 400);
            throw new BadRequestException("can't update the course Id");

        }

        return this.service.updateCourse(courseId, changes);
    }

    @Delete(':courseId')
    async deleteCourse(@Param('courseId') courseId: string) {

        console.log('deleting course');
        this.service.deleteCourse(courseId);
    }
}
