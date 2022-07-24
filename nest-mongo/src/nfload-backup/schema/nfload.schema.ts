import * as mongoose from 'mongoose';

export const NFLoadSchema = new mongoose.Schema({
    nfId: String,
    nfLoad: Number,
    ts: Date,
    nfLoadTimestamp: Number,
}, { strict: false,   collection: 'nfload_history'})
