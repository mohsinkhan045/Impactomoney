import { z } from "zod";

export const BasicSignupSchema = z
  .object({
    name: z.string().min(3, "Name is required"), // Mandatory
    email: z.string().email("Invalid email format"), // Mandatory
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
    confirmpassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"), // Mandatory
    // role: z.enum(["Provider", "Beneficiary"], { errorMap: () => ({ message: "Role is required" }) }), // Mandatory
    cnic: z
      .string()
      .regex(/^[0-9]{13}$/, "CNIC must be 13 digits"), // Mandatory
      phone: z
      .string(),
    home: z.string().min(3, "Home address is required").optional(), // Optional
    city: z.string().min(3, "City is required"), // Mandatory
    country: z.string().min(3, "Country is required"), // Mandatory
})
