import { Test, TestingModule } from '@nestjs/testing';
import { SliceloadController } from './sliceload.controller';

describe('SliceloadController', () => {
  let controller: SliceloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SliceloadController],
    }).compile();

    controller = module.get<SliceloadController>(SliceloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
