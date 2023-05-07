import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User{

    @Prop({ required: true })
    user_id: number;
    @Prop({ required: true })
    email: string;
    @Prop({ required: true })
    forename: string;
    @Prop({ required: true })
    surname: string;
    @Prop({ required: true })
    phone: string;
    @Prop({ required: true })
    passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
