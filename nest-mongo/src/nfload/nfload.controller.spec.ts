import { Test, TestingModule } from '@nestjs/testing';
import { NfloadController } from './nfload.controller';

describe('NfloadController', () => {
  let controller: NfloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NfloadController],
    }).compile();

    controller = module.get<NfloadController>(NfloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
