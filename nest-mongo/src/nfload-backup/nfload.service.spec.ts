import { Test, TestingModule } from '@nestjs/testing';
import { NfloadService } from './nfload.service';

describe('NfloadService', () => {
  let service: NfloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfloadService],
    }).compile();

    service = module.get<NfloadService>(NfloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
