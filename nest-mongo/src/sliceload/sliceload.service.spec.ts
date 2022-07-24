import { Test, TestingModule } from '@nestjs/testing';
import { SliceloadService } from './sliceload.service';

describe('SliceloadService', () => {
  let service: SliceloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SliceloadService],
    }).compile();

    service = module.get<SliceloadService>(SliceloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
