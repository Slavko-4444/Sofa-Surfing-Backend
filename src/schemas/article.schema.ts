import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;


@Schema()
export class Article {

    @Prop({ required: true })
    user_id: string;
    @Prop({ required: true })
    title: string;
    @Prop({ required: true})
    excerpt: string;
    @Prop({ required: true})
    description: string;
    @Prop({ required: false })
    image_path: string[];
    @Prop({ required: true})  
    status: "visible"|"hidden" = "visible";
    @Prop({ type: Date, default: Date.now })
    created_at: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
