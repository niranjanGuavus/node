import * as mongoose from 'mongoose';

import { NFLoadSchemaName } from '../constants';

export const nfLoadSchema = new mongoose.Schema(
  {
    nfId: String,
    nfLoad: Number,
    ts: Date,
    nfLoadTimestamp: Number,
  },
  { strict: false, collection: NFLoadSchemaName.NF_LOAD_HISTORY }
);
