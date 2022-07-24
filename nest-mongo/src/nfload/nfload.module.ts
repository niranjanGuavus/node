import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NFLoadSchemaName } from './constants';
import { NfloadController } from './nfload.controller';
import { NfloadService } from './nfload.service';
import { nfLoadSchema } from './schema/nfload.schema';
import { nfLoadPrediction } from './schema/nfload-prediction.schema';
import { nfProfileSchema } from './schema/nfprofile.schema';
import { oamResUsage } from './schema/oam-res-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NFLoadSchemaName.NF_LOAD_HISTORY, schema: nfLoadSchema },
      { name: NFLoadSchemaName.NF_LOAD_PROFILES, schema: nfProfileSchema },
      { name: NFLoadSchemaName.NF_LOAD_PREDICTION, schema: nfLoadPrediction },
      { name: NFLoadSchemaName.OAM_RES_USAGE, schema: oamResUsage },
    ]),
  ],
  controllers: [NfloadController],
  providers: [NfloadService],
})
export class NfloadModule {}
