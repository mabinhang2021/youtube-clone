import { db } from "@/db";
import { subscriptions} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
    create:protectedProcedure
        .input(z.object({userId:z.string().uuid()}))
        .mutation(async ({ctx, input})=>{
            const { userId } = input;
            if(ctx.user.id === userId) {
                throw new Error("You cannot subscribe to yourself");
            }
            const [createdSubsrciption] = await db.insert(subscriptions)
            .values({
                viewerId: ctx.user.id,
                creatorId: userId,
            })
            .returning();  
            return createdSubsrciption;
    }),
    remove:protectedProcedure
        .input(z.object({userId:z.string().uuid()}))
        .mutation(async ({ctx, input})=>{
            const { userId } = input;
            if(ctx.user.id === userId) {
                throw new Error("You cannot subscribe to yourself");
            }
            const [deletedSubsrciption] = await db.delete(subscriptions)
            .where(
                and(
                    eq(subscriptions.viewerId, ctx.user.id),
                    eq(subscriptions.creatorId, userId),
                )   
            )
            .returning();  
            return deletedSubsrciption;
    }),

    
    



       
})