import { Module } from '@nestjs/common';
import { SliceloadController } from './sliceload/sliceload.controller';
import { SliceloadService } from './sliceload/sliceload.service';

@Module({
  controllers: [SliceloadController],
  providers: [SliceloadService]
})
export class SliceloadModule {}
