import * as mongoose from 'mongoose';

export const NFProfileSchema = new mongoose.Schema({
    nfInstanceId: String,
    nfType: String,
    nfStatus: String,
    loadTimeStamp: Number,
}, { strict: false,   collection: 'nfprofiles'})
