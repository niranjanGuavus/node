import * as mongoose from 'mongoose';

export const nfLoadPrediction = new mongoose.Schema({
    nfId: String,
    nfLoad: Number,
    ts: Date,
    nfLoadTimestamp: Number,
    confidenceScore: Number,
}, { strict: false,   collection: 'nfload_prediction'})
