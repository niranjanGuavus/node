import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

//@Injectable()
export class ToIntegerPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata):number {
    
    const val = parseInt(value);
    if(isNaN(val)) {
      throw new BadRequestException('Conversation to number failed  ,'+ value)
    }
    return val;
  }
}
