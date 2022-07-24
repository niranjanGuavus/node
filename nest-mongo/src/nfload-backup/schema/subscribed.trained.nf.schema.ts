import * as mongoose from 'mongoose';

export const subscribedTrainedNFSchema = new mongoose.Schema({
    analyticsId: String,
    nfId: String,
    startTs: Number,
    latestTS: Number,
}, { strict: false,   collection: 'subscribed_trained_nf_status'})
