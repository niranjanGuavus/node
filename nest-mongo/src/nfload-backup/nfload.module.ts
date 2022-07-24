import { subscribedTrainedNFSchema } from './schema/subscribed.trained.nf.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NfloadController } from './nfload.controller';
import { NfloadService } from './nfload.service';
import { NFLoadSchema } from './schema/nfload.schema';
import { NFProfileSchema } from './schema/nfprofile.schema';
import { nfLoadPrediction } from './schema/nfload.prediction';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'nfLoad', schema: NFLoadSchema },
    { name: 'nfProfile', schema: NFProfileSchema },
    { name: 'nfLoadPrediction', schema: nfLoadPrediction },
    { name: 'subscribedTrainedNFStatus', schema: subscribedTrainedNFSchema }
  ])],
  controllers: [NfloadController],
  providers: [NfloadService]
})
export class NfloadModule { }
