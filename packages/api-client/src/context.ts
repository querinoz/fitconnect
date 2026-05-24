import { z } from "zod";

export type ContextUser = {
  id: string;
  role: "athlete" | "coach" | "admin";
  email?: string;
};

export type Context = {
  user: ContextUser | null;
  strava?: import("./strava-service").StravaTrpcService;
};

export async function createContext(opts: {
  user?: ContextUser | null;
  strava?: import("./strava-service").StravaTrpcService;
}): Promise<Context> {
  return { user: opts.user ?? null, strava: opts.strava };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export { paginate, parsePagination, type PaginationInput } from "./pagination";
