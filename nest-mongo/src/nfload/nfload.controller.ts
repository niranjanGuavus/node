import { Controller, Get } from '@nestjs/common';
 import { debug } from 'console';
 import { NfloadService } from './nfload.service';
// import { Course } from '../course/schemas/course.schema';

@Controller('nfload')
export class NfloadController {
    constructor(private service:NfloadService){

    }
    
    // @Get('courses')
    // async findCourses():Promise<Course[]>{
    //     debug;
    //     return this.service.findAll()
    // }
}
