import { Schema, models, model } from "mongoose";
import mongoose from "mongoose";
import { optional } from "zod";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Beneficiary", "Provider", "Admin"],
      required: true,
    },
    cnic: {
      type: String,
      unique: true,
      required: function () {
        return this.role !== "Admin";
      },
    },
    voucherCategory: {
      type: String,
      enum: ["Education", "Health", "Children", "Religion"],
      required: function () {
        return this.role === "Beneficiary";
      },
    },
    subEducationCategory: {
      type: String,
      enum: ["university", "college", "school"],
      optional: function () {
        return (
          this.role === "Beneficiary" ||
          ("Provider" && this.voucherCategory === "Education")
        );
      },
    },
    subReligionCategory: {
      type: String,
      enum: ["Mosque", "Church", "Temple", "Any specific Institution"],
      optional: function () {
        return this.role === "Provider" && this.voucherCategory === "Religion";
      },
    },
    subCategory: {
      type: String,
      enum: [],
    },
    religion: {
      type: String,
    },
    childrenPurpose: {
      // Generalized field for all categories
      type: [String], // Assuming childrenPurpose can be an array of strings
      default: [],
    },
    voucherDetails: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
      validate: {
        validator: async function (value) {
          if (this.role === "Beneficiary") {
            if (this.voucherCategory === "Education") {
              if (this.subEducationCategory === "university") {
                return (
                  value.has("university") &&
                  value.has("cgpa") &&
                  value.has("purpose")
                );
              } else if (this.subEducationCategory === "college") {
                return (
                  value.has("college") &&
                  value.has("grades") &&
                  value.has("purpose")
                );
              } else if (this.subEducationCategory === "school") {
                return (
                  value.has("school") &&
                  value.has("grades") &&
                  value.has("purpose")
                );
              }
            } else if (this.voucherCategory === "Health") {
              return (
                value.has("hospital") &&
                value.has("disease") &&
                value.has("purpose")
              );
            } else if (this.voucherCategory === "Children") {
              return (
                value.has("age") &&
                value.has("guardian") &&
                value.has("purpose") &&
                Array.isArray(this.childrenPurpose) &&
                this.childrenPurpose.length > 0
              );
            } else if (this.voucherCategory === "Religion") {
              return value.has("religion");
            }
          } else if (this.role === "Provider") {
            if (
              !value.has("providerName") ||
              !value.has("city") ||
              !value.has("country")
            ) {
              return false;
            }
            const providerExists = await mongoose.models.User.findOne({
              "voucherDetails.providerName": value.get("providerName"),
              _id: { $ne: this._id },
            });
            if (providerExists) {
              throw new Error(
                `Provider "${value.get(
                  "providerName"
                )}" is already registered in the system`
              );
            }
          }
          return true; // No specific requirements for Admin
        },
        message:
          "voucherDetails must have correct voucher details based on the role and voucher category.",
      },
    },
    resetCode: { type: String, default: null },
    resetCodeExpiry: { type: Date, default: null },
    wallet_address: { type: String, default: null, unique: true },
    picture: { type: String, default: null },
    phone: { type: String, default: null, unique: true },
    home: { type: String, default: null },
    city: { type: String, default: null },
    transferCount:{type:Number, default:0},
    country: { type: String, default: null },
    religion: {
      type: String,
      enum: [
        "Islam",
        "Christianity",
        "Judaism",
        "Hinduism",
        "Buddhism",
        "Other",
      ],
      default: null,
    },
    status: {
      type: String,
      default: "new",
      validate: {
        validator: function (value) {
          const validStatuses = {
            Beneficiary: [
              "new",
              "approved",
              "rejected",
              "funded",
              "voucherIssued",
            ],
            Provider: ["new", "approved", "rejected", "black-listed"],
            Admin: ["new", "approved", "rejected"],
          };
          return (
            validStatuses[this.role] && validStatuses[this.role].includes(value)
          );
        },
        message: (props) =>
          `${props.value} is not a valid status for role ${this.role}.`,
      },
    },
    isMinted: {
      type: Boolean,
      default: false,
    },
    // Add this field to your schema
    isTransfered: {
      type: Boolean,
      default: false,
    },
    issuedVoucher: {
      type: Boolean,
      default: false,
    },
    redeemedVoucher: {
      type: Boolean,
      default: false,
    },
    documents: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 4,
        message: "documents can have a maximum of 4 items.",
      },
    },
  },
  { timestamps: true }
);
// Add a compound index for phone and cnic
userSchema.index(
  { phone: 1, cnic: 1, email: 1, wallet_address: 1 },
  { unique: true }
);

export default models.User || model("User", userSchema);
