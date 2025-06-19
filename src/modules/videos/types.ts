import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type VideoGetOneOutput = inferRouterOutputs<AppRouter>["videos"]["getOne"];


//todo: change to videos getmany
export type VideoGetManyOutput = inferRouterOutputs<AppRouter>["suggestions"]["getMany"];