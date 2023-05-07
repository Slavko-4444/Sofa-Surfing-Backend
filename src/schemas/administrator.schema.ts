import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Administrator{

    @Prop({ required: true })
    admin_id: number;
    @Prop({ required: true })
    username: string;
    @Prop({ required: true })
    passwordHash: string;
}

export const AdministratorSchema = SchemaFactory.createForClass(Administrator);
