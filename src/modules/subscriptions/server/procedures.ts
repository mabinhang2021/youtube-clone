import { db } from "@/db";
import { subscriptions, users} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
    getMany:protectedProcedure
        .input(z.object({
            cursor:z.object({
                creatorId:z.string().uuid(),
                updatedAt:z.date(),
            })
            .nullish(),
            limit:z.number().min(1).max(100),
        }))
        .query(async ({ctx, input})=>{
            const { cursor,limit } = input;
            const {id:userId} = ctx.user;

            const data = await db
            .select({
                ...getTableColumns(subscriptions),
                user:{
                    ...getTableColumns(users),
                    subscriberCount:db.$count(
                        subscriptions,
                        eq(subscriptions.creatorId, users.id)
                    )
                }
                
            }).
            from(subscriptions)
            .innerJoin(users, eq(subscriptions.creatorId, users.id))
            .where(
                and(
                    eq(subscriptions.viewerId, userId),
                    cursor ?
                    or(
                        lt(subscriptions.updatedAt, cursor.updatedAt),
                        and(
                            eq(subscriptions.updatedAt, cursor.updatedAt),
                            lt(subscriptions.creatorId, cursor.creatorId)
                        )
                        
                    ) : undefined,

                )).orderBy(
                    desc(subscriptions.updatedAt),
                    desc(subscriptions.creatorId),
                ).limit(limit +1)
                const hasMore = data.length > limit;
                // Remove the last item if there is more data
                const items = hasMore ? data.slice(0, -1) : data;
                // Set the next cursor to the last item if there is more data
                const lastItem = items[items.length - 1];
                const nextCursor = hasMore 
                  ? {
                    creatorId: lastItem.creatorId,
                    updatedAt: lastItem.updatedAt,
                  }
                  : null;
          
                return {
                  items,
                  nextCursor,
                };
              }),

        
    
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