import { z } from "zod";

export type ContextUser = {
  id: string;
  role: "athlete" | "coach" | "admin";
  email?: string;
};

export type Context = {
  user: ContextUser | null;
};

export async function createContext(opts: {
  user?: ContextUser | null;
}): Promise<Context> {
  return { user: opts.user ?? null };
}

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional()
});
