import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NfloadController } from './nfload.controller';
import { NfloadService } from './nfload.service';
import { CourseSchema } from '../course/schemas/nest.course.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: 'course', schema: CourseSchema}])],
  controllers: [NfloadController],
  providers: [NfloadService]
})
export class NfloadModule {}
