import * as mongoose from 'mongoose';

export const CoursesSchema = new mongoose.Schema({
    //seqNo: {type: Number, required: true},// it means this field is mandatory if not it will through the exception.
    seqNo: Number,
    url: String,
    iconUrl: String,
    courseListIcon: String,
    description: String,
    longDescription: String,
    category: String,
    lessonsCount: Number,
    promo: Boolean,
}, { strict: false, collection:'courses' })