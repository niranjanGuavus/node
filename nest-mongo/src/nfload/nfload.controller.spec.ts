import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { NFLoadSchemaName } from './constants';
import { NfloadController } from './nfload.controller';
import { NfloadService } from './nfload.service';

describe('NfloadController', () => {
  let controller: NfloadController;

  beforeEach(async () => {
    const mockRepository = {
      find() {
        return {};
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NfloadController],
      providers: [
        NfloadService,
        { provide: getModelToken(NFLoadSchemaName.NF_LOAD_HISTORY), useValue: mockRepository },
        { provide: getModelToken(NFLoadSchemaName.NF_LOAD_PROFILES), useValue: mockRepository },
        { provide: getModelToken(NFLoadSchemaName.NF_LOAD_PREDICTION), useValue: mockRepository },
        { provide: getModelToken(NFLoadSchemaName.OAM_RES_USAGE), useValue: mockRepository },
      ],
    }).compile();

    controller = module.get<NfloadController>(NfloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
