import { Schema, model, models } from "mongoose";

const TokenBeneficiarySchema = new Schema(
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
      // unique: true, // Ensure CNIC is unique
      // trim: true,
    },
    voucherCategory: {
      type: String,
      enum: ["Children", "Education", "Health", "Religion"],
      required: true,
    },
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
      required: true,
      default: 0, // Default amount
    },
    currency: {
      type: Number,
      required: true,
      default: null, // Default currency
    },
    voucherId: {
      type: String,
      required: true,
      default: "",
    },
   
    // Add this field to your schema
    isTransfered: {
      type: Boolean,
      default: false,
    },
    checkItems: {
      type: [String], // Array of strings for checkItems
      default: [], // Default to an empty array
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export default models.ReligionTokenDetails ||
  model("ReligionTokenDetails", TokenBeneficiarySchema);
