import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdministratorDocument = HydratedDocument<Administrator>;

@Schema()
export class Administrator{

    @Prop({ required: true })
    username: string;
    @Prop({ required: true })
    passwordHash: string;
}

export const AdministratorSchema = SchemaFactory.createForClass(Administrator);
