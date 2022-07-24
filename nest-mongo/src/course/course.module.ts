import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { CourseController } from './controller/course.controller';
import { CourseService } from './service/course.service';
import { CoursesSchema } from './schemas/courses.schema';


@Module({
  imports: [MongooseModule.forFeature([{name: 'angCourse', schema: CoursesSchema}])],
  controllers: [CourseController],
  providers: [CourseService]
  
})
export class CourseModule {

}
