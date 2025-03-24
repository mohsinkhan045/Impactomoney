import { Schema, model, models } from 'mongoose';

const DistributedVouchers = new Schema(
    {
        picture: {
          type: String,
          default: "https://via.placeholder.com", // Default placeholder image
        },
        name: {
          type: String,
          required: true, // Name is required
          trim: true,
        },
        email: {
          type: String,
          required: true,
          unique: true, // Ensure email is unique
          trim: true,
          lowercase: true,
        },
        cnic: {
          type: String,
          required: true,
        },
        voucherCategory: { type: String, enum: ["Children", "Education", "Health"], required: true },
        voucherDetails: {
          type: Schema.Types.Mixed, // Store additional details as a JSON object
          default: {},
        },
        wallet_address: {
          type: String,
          required: true,
          unique: true, // Wallet address must be unique
        },
        phone: {
          type: String,
          required: true,
          trim: true,
        },
        home: {
          type: String,
          default: "Unknown Address",
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        country: {
          type: String,
          required: true,
          trim: true,
        },
        status: {
          type: String,
          enum: ["approved", "funded", "voucherIssued"],
          default: "pending", // Default status
        },
        amount: {
          type: Number,
          required:true,
          default: 0, // Default amount
        },
        currency: {
          type: String,
          required: true,
          
        },
        voucherId: {
          type: String,
          required:true,
          default: "",
        },
        metadata: {
          type: Object,
          required:true,
          default: {}, 
        },
      },
      {
        timestamps: true, // Automatically add createdAt and updatedAt fields
      }
    
);

export default models.DistributedVouchers ||
   model("DistributedVouchers", DistributedVouchers);
