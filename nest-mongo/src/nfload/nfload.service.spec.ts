import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { NFLoadSchemaName } from './constants';
import { NfloadService } from './nfload.service';

describe('NfloadService', () => {
  let service: NfloadService;

  beforeEach(async () => {
    const mockRepository = {
      find() {
        return {};
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfloadService,
        { provide: getModelToken(NFLoadSchemaName.NF_LOAD_HISTORY), useValue: mockRepository },
        { provide: getModelToken(NFLoadSchemaName.NF_LOAD_PROFILES), useValue: mockRepository },
        { provide: getModelToken(NFLoadSchemaName.NF_LOAD_PREDICTION), useValue: mockRepository },
        { provide: getModelToken(NFLoadSchemaName.OAM_RES_USAGE), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NfloadService>(NfloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
