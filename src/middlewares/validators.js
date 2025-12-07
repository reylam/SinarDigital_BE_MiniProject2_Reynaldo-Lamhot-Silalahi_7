import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userStatusSchema = z.object({
  status: z.enum(["online", "offline", "away"]),
});

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assigned_to: z.coerce.number().int().positive("Invalid user ID"),
  due_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  attachment: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal(""))
    .optional(),
});

export const jobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  attachment: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal(""))
    .optional(),
});

export const jobSeekerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  skills: z.string().min(5, "Skills must be at least 5 characters"),
  experience_years: z.coerce
    .number()
    .int()
    .min(0, "Experience years cannot be negative")
    .max(50, "Invalid experience years"),
  applied_job_id: z.coerce.number().int().positive("Invalid job ID"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
  assigned_to: z.coerce.number().int().positive().optional(),
  due_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .optional(),
  attachment: z.string().url().optional().or(z.literal("")).optional(),
});

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      console.log("❌ Validation error type:", error.constructor.name);

      // PERBAIKAN: Gunakan error.issues bukan error.errors
      if (error instanceof z.ZodError) {
        console.log("🔧 ZodError issues:", error.issues);

        // Format errors dari issues
        const errors = error.issues.map((issue) => ({
          field: issue.path?.join(".") || "unknown",
          message: issue.message || "Validation error",
          code: issue.code,
        }));

        return res.status(400).json({
          error: "Validation Error",
          details: errors,
        });
      }
      next(error);
    }
  };
};
