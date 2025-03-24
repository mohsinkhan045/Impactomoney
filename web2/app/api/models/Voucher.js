import { Schema, models, model } from 'mongoose';

// Voucher schema definition
const voucherSchema = new Schema({
    voucherId: { type: String, required: true },
    voucherName: { type: String, required: true },
    voucherIssuer: { type: String, required: true },
    voucherType: { type: String, required: true },
    walletAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
    amount: { type: Number, required: true },
    currencyChoice: { type: Number, required: true },
    metaDataUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'redeemed', 'expired'],
        default: 'active',
        required: true,
    },
    revoked: {
        type: Boolean,
        default: false, // Default to 'false' when a voucher is created
        required: true,
    },
});


// Export the Voucher model
export default models.Voucher || model('Voucher', voucherSchema);
