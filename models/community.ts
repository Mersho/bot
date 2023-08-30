import mongoose, { Document, Schema, Types } from 'mongoose';

const arrayLimits = (val: any[]): boolean => {
    return val.length > 0 && val.length <= 2;
};

const currencyLimits = (val: string): boolean => {
    return val.length > 0 && val.length < 10;
};


export interface OrderChannel extends Document {
    name: string;
    type: string;
}

const OrderChannelSchema = new Schema<OrderChannel>({
    name: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['buy', 'sell', 'mixed'],
    },
});

export interface usernameId extends Document {
    id: string;
    username: string;
}

const usernameIdSchema = new Schema<usernameId>({
    id: { type: String, required: true },
    username: { type: String, required: true, trim: true },
});

export interface Community extends Document {
    name: string;
    creator_id: string;
    group: string;
    order_channels: Types.DocumentArray<OrderChannel>;
    fee: number;
    earnings: number;
    orders_to_redeem: number;
    dispute_channel: string;
    solvers: Types.DocumentArray<usernameId>;
    banned_users: Types.DocumentArray<usernameId>;
    public: boolean;
    currencies: Array<string>;
    created_at: Date;
    nostr_public_key: string;
}

const CommunitySchema = new Schema<Community>({
    name: {
        type: String,
        unique: true,
        maxlength: 30,
        trim: true,
        required: true,
    },
    creator_id: { type: String },
    group: { type: String, trim: true }, // group Id or public name
    order_channels: {
        // array of Id or public name of channels
        type: [OrderChannelSchema],
        validate: [arrayLimits, '{PATH} is not within limits'],
    },
    fee: { type: Number, min: 0, max: 100, default: 0 },
    earnings: { type: Number, default: 0 }, // Sats amount to be paid to the community
    orders_to_redeem: { type: Number, default: 0 }, // Number of orders calculated to be redeemed
    dispute_channel: { type: String }, // Id or public name, channel to send new disputes
    solvers: [usernameIdSchema], // users that are dispute solvers
    banned_users: [usernameIdSchema], // users that are banned from the community
    public: { type: Boolean, default: true },
    currencies: {
        type: [String],
        required: true,
        trim: true,
        validate: [currencyLimits, '{PATH} is not within limits'],
    },
    created_at: { type: Date, default: Date.now },
    nostr_public_key: { type: String },
});


module.exports = mongoose.model<Community>('Community', CommunitySchema);