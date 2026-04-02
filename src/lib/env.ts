import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 characters"),
  MASTER_KEY: z
    .string()
    .min(1, "MASTER_KEY is required")
    .transform((value, ctx) => {
      const buffer = Buffer.from(value, "base64");

      if (buffer.length !== 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MASTER_KEY must decode to 32 bytes from base64",
        });
        return z.NEVER;
      }

      return value;
    }),
  SESSION_COOKIE_NAME: z.string().default("account_mgr_session"),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(24),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    APP_SECRET: process.env.APP_SECRET,
    MASTER_KEY: process.env.MASTER_KEY,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    SESSION_TTL_HOURS: process.env.SESSION_TTL_HOURS,
  });

  return cachedEnv;
}
