import { z } from "zod";

export const platformSchema = z.object({
  name: z.string().trim().min(1, "请输入平台名称"),
  websiteUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => !value || /^https?:\/\//.test(value), "网址必须以 http:// 或 https:// 开头"),
});

export type PlatformInput = z.infer<typeof platformSchema>;
