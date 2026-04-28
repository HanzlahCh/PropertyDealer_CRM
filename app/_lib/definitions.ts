import * as z from "zod";

// ── Auth schemas ──

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .trim(),
  email: z
    .string()
    .email({ message: "Please enter a valid email" })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[a-zA-Z]/, { message: "Must contain at least one letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .trim(),
  role: z.enum(["admin", "agent"]).default("agent"),
});

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email" })
    .trim()
    .toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
});

// ── Type exports ──

export type SignupFormData = z.infer<typeof SignupFormSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

// ── Session payload type ──

export interface SessionPayload {
  userId: string;
  role: "admin" | "agent";
  expiresAt: Date;
}
