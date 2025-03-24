// models/InvalidToken.js
import { Schema, models, model } from 'mongoose';

// Define InvalidToken schema to store invalidated JWTs
const invalidTokenSchema = new Schema(
    {
        token: {
            type: String,
            required: true,
        },
        expiredAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default models.InvalidToken || model('InvalidToken', invalidTokenSchema);
