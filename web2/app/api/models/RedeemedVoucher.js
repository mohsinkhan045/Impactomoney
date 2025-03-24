import { Schema, model, models } from 'mongoose';

const redeemedVoucherSchema = new Schema(
    {
        beneficiaryId: { type: String, required: true },
        beneficiaryName: { type: String, required: true },
        beneficiaryEmail: { type: String, required: true },
        serviceProviderId: { type: String, required: true },
        serviceProviderName: { type: String, required: true  },
        amount: {type : Number, required:true},
        voucherId: { type: Schema.Types.ObjectId, ref: 'Voucher', required: true }, // Reference to Voucher model
        redeemedAt: { type: Date, default: Date.now },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default models.RedeemedVoucher || model('RedeemedVoucher', redeemedVoucherSchema);
