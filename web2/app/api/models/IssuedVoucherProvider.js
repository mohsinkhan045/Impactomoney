import mongoose from "mongoose";

const IssuedVoucherProviderSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    picture: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    name: {
      type: String,
      default: "Unknown Name",
    },
    email: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      default: "",
    },
    voucherCategory: {
      type: String,
      required: true,
    },
    voucherDetails: {
      type: Object,
      default: {},
    },
    wallet_address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "000-000-0000",
    },
    home: {
      type: String,
      default: "Unknown Address",
    },
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["approved", "funded"],
      default: "unknown",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const IssuedVoucherProvider = mongoose.models.IssuedVoucherProvider || mongoose.model("IssuedVoucherProvider", IssuedVoucherProviderSchema);

export default IssuedVoucherProvider;