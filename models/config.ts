import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
    maintenance: boolean;
    node_status: string;
    node_uri: string;
}


const configSchema = new Schema<IConfig>({
    maintenance: { type: Boolean, default: false },
    node_status: { type: String, default: 'down' },
    node_uri: { type: String },
});

const Config = mongoose.model<IConfig>('Config', configSchema);
export default Config;
