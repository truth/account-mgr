import { z } from "zod";

export const accountSchema = z.object({
  platformId: z.string().trim().min(1, "请选择所属平台"),
  siteName: z.string().trim().min(1, "请输入站点名称"),
  username: z.string().trim().min(1, "请输入账号"),
  password: z.string().trim().min(1, "请输入密码"),
  notes: z.string().optional(),
  registrationInfo: z.string().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  isFavorite: z.boolean().default(false),
});

export const accountUpdateSchema = accountSchema.extend({
  password: z.string().trim().optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
