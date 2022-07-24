import * as mongoose from 'mongoose';

import { NFLoadSchemaName } from '../constants';

export const nfLoadPrediction = new mongoose.Schema(
  {
    nfId: String,
    nfLoad: Number,
    ts: Date,
    nfLoadTimestamp: Number,
    confidenceScore: Number,
  },
  { strict: false, collection: NFLoadSchemaName.NF_LOAD_PREDICTION }
);
