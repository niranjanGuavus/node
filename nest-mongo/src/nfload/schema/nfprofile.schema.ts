import * as mongoose from 'mongoose';

import { NFLoadSchemaName } from '../constants';

export const nfProfileSchema = new mongoose.Schema(
  {
    nfInstanceId: String,
    nfType: String,
    nfStatus: String,
    loadTimeStamp: Number,
  },
  { strict: false, collection: NFLoadSchemaName.NF_LOAD_PROFILES }
);
