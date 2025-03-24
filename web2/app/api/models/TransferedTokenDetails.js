import { Schema, model, models } from "mongoose";

const transferedTokenDetailsSchema = new Schema({
  walletAddress: {
    type: String,
    required: [true, "Wallet address is required"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount cannot be negative"],
  },
  Education: {
    type: String,
    required: [true, "Education details are required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.TransferedTokenDetails ||
  model("TransferedTokenDetails", transferedTokenDetailsSchema);
