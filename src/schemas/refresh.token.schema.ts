import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  HydratedDocument } from 'mongoose';

export type UserTokenDocument = HydratedDocument<User_token>;


@Schema()
export class User_token{

    @Prop({ required: true })
    user_id: string;
    @Prop({ required: true })
    token: string;
    @Prop({ required: true, type: Date})
    expires_at: Date;
    @Prop({ type: Date, default: Date.now })
    created_at: Date;
}

export const User_tokenSchema = SchemaFactory.createForClass(User_token);
