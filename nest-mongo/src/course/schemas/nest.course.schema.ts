import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


export type CourseDocument = CourseNest & Document;
@Schema()
export class CourseNest {
   
    @Prop()
    seqNo:number;

    @Prop()
    url:string;

    @Prop()
    iconUrl:string;

    @Prop()
    courseListIcon:string;

    @Prop()
    description:string;

    @Prop()
    longDescription:string;

    @Prop()
    category:number;

    @Prop()
    lessonsCount:number;

    @Prop()
    promo:boolean;

}

export const CourseSchema = SchemaFactory.createForClass(CourseNest);
