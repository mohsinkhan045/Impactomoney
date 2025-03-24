import { Agent } from "http";
import { z } from "zod";

export const SignupSchema = z
  .object({
    role: z.enum(["Provider", "Beneficiary"], {
      errorMap: () => ({ message: "Role is required" }),
    }),
    voucherCategory: z.enum(["Education", "Health", "Children", "Religion"], {
      errorMap: () => ({ message: "Voucher Category is required" }),
    }),
    subCategory: z.string().optional(),
    subEducationCategory: z.string().optional(),
    password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .refine(value => /[A-Z]/.test(value), {
      message: "Password must have at least one uppercase letter",
    })
    .refine(value => /[a-z]/.test(value), {
      message: "Password must have at least one lowercase letter",
    })
    .refine(value => /\d/.test(value), {
      message: "Password must have at least one digit",
    })
    .refine(value => /[@$!%*?&]/.test(value), {
      message: "Password must have at least one special character",
    }), // Mandatory

    additionalInfo: z.object({
      providerName: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      university: z.string().optional(),
      cgpa: z.string().optional(),
      hospital: z.string().optional(),
      disease: z.string().optional(),
      age: z.string().optional(),
      guardian: z.string().optional(),
      grades: z.string().optional(), 
    }),
    wallet_address: z
      .string()
      .length(42, "Wallet address must be exactly 42 characters long")
      .regex(
        /^0x[a-fA-F0-9]{40}$/,
        "Wallet address must start with '0x' and contain only hexadecimal characters"
      ),
  })
  .superRefine((data, ctx) => {
    if (data.role === "Beneficiary") {
       if (data.voucherCategory === "Education") {
      if (data.subEducationCategory === "university") {
        if (!data.additionalInfo.university || !data.additionalInfo.university.trim()) {
          ctx.addIssue({
            path: ["additionalInfo", "university"],
            message: "University name is required for the education voucher category.",
          });
        }
      } else if (data.subEducationCategory === "college" || data.subEducationCategory === "school") {
        if (!data.additionalInfo.grades || !data.additionalInfo.grades.trim()) {
          ctx.addIssue({
            path: ["additionalInfo", "grades"],
            message: "Grades are required for college or school under the education voucher category.",
          });
        }
      }
      } else if (data.voucherCategory === "Health") {
        if (!data.additionalInfo.hospital || !data.additionalInfo.hospital.trim()) {
          ctx.addIssue({
            path: ["additionalInfo", "hospital"],
            message: "Hospital name is required for the health voucher category.",
          });
        }
      } else if (data.voucherCategory === "Children") {
        if (!data.additionalInfo.age || Number(data.additionalInfo.age) <= 0) {
          ctx.addIssue({
            path: ["additionalInfo", "age"],
            message: "Accurate age is required for the children voucher category.",
          });
        }
        if (!data.additionalInfo.guardian || !data.additionalInfo.guardian.trim()) {
          ctx.addIssue({
            path: ["additionalInfo", "guardian"],
            message: "Guardian name is required for the children voucher category.",
          });
        }
      }
    }

    if (data.role === "Provider") {
      if (!data.additionalInfo.providerName || !data.additionalInfo.providerName.trim()) {
        ctx.addIssue({
          path: ["additionalInfo", "providerName"],
          message: "Provider name is required for providers.",
        });
      }
      if (!data.additionalInfo.city || !data.additionalInfo.city.trim()) {
        ctx.addIssue({
          path: ["additionalInfo", "city"],
          message: "City is required for providers.",
        });
      }
      if (!data.additionalInfo.country || !data.additionalInfo.country.trim()) {
        ctx.addIssue({
          path: ["additionalInfo", "country"],
          message: "Country is required for providers.",
        });
      }
    }
  });