import * as mongoose from 'mongoose';

import { NFLoadSchemaName } from '../constants';

export const oamResUsage = new mongoose.Schema(
  {
    nfId: String,
    nfCpuUsage: Number,
    nfMemoryUsage: Number,
    nfStorageUsage: Number,
    ts: Date,
  },
  { strict: false, collection: NFLoadSchemaName.OAM_RES_USAGE }
);
