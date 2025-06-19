import { db } from "@/db";
import { commentInsertSchema, commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
    create:protectedProcedure
        .input(z.object({
            parentId: z.string().uuid().nullish(),
            videoId: z.string().uuid(),
            value: z.string(),
        }))
        .mutation(async ({ctx, input})=>{
            const { videoId ,value,parentId} = input;
            const { id:userId} = ctx.user;

            const [existingComment] = await db.select().from(comments)
            .where(inArray(comments.id,parentId ? [parentId] : []))

            if(parentId && !existingComment) {
                throw new Error("Parent comment not found");
            }

            if(existingComment && parentId &&existingComment.parentId){
                throw new Error("You cannot reply to a reply comment");
            }
            
            const [createdComment] = await db.insert(comments)
            .values({
                videoId,
                userId,
                parentId,
                value,
            })
            .returning();
            return createdComment;
        }),
    
        remove:protectedProcedure
        .input(z.object({
            id: z.string().uuid(),
           
        }))
        .mutation(async ({ctx, input})=>{
            const { id } = input;
            const { id:userId} = ctx.user;
            
            const [deletedComment] = await db.delete(comments)
            .where(and(
                eq(comments.id, id),
                eq(comments.userId, userId),
            )).returning();

            if(!deletedComment) throw new Error("Comment not found or you are not the owner of the comment");

            return deletedComment;
        }),
        
    getMany:baseProcedure.input(z.object({
        videoId: z.string().uuid(),
        parentId: z.string().uuid().nullish(),
        cursor:z.object({
            id: z.string().uuid(),
            updatedAt: z.date(),}).nullish(),
        limit:z.number().min(1).max(100),
     }))
        .query(async ({input,ctx})=>{
            const { videoId,cursor,limit,parentId } = input;
            const {clerkUserId} = ctx
            let userId
            const [user] = await db.select().from(users)
            .where(inArray(users.clerkId,clerkUserId ? [clerkUserId] : []))

            if(user) {
                userId = user.id;
            }

            const viewerReactions = db.$with("viewer_reactions").as(
                db.select({
                    commentId:commentReactions.commentId,
                    type:commentReactions.type,
                }).from(commentReactions)
                .where(inArray(commentReactions.userId, userId ? [userId] : []))
                
            )

            const replies = db.$with("replies").as(
                db.select({
                    parentId:comments.parentId,
                    count:count(comments.id).as("count"),
                }).from(comments)
                .where(isNotNull(comments.parentId))
                .groupBy(comments.parentId)
            )

            const [totalData,data] = await Promise.all([
                 db.select(
                    {count:count()}
                ).from(comments).where(eq(comments.videoId, videoId)),
                 db.with(viewerReactions,replies)
                    .select({
                    ...getTableColumns(comments),
                    user:users,
                    viewerReaction:viewerReactions.type,
                    replyCount:replies.count,
                    likeCount:db.$count(commentReactions,and(
                        eq(commentReactions.commentId, comments.id),
                        eq(commentReactions.type, "like")
                    )),
                    dislikeCount:db.$count(commentReactions,and(
                        eq(commentReactions.commentId, comments.id),
                        eq(commentReactions.type, "dislike")
                    )),
                }).from(comments)
                .where(and(
                    eq(comments.videoId, videoId),
                    parentId ? eq(comments.parentId, parentId) :
                    isNull(comments.parentId), // only get top-level comments
                    cursor ? or(
                                        lt(comments.updatedAt, cursor.updatedAt),
                                        and(
                                            eq(comments.updatedAt, cursor.updatedAt),
                                            lt(comments.id, cursor.id)
                                        )
                                    ) : undefined
                ))
                .innerJoin(users, eq(comments.userId, users.id))
                .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
                .leftJoin(replies, eq(replies.parentId, comments.id))
                .orderBy(desc(comments.updatedAt),desc(comments.id))
                .limit(limit + 1) // add 1 to the limit to check if there is more data

            ])

           
            
            const hasMore = data.length > limit;
            // remove the last item if there is more data
            const items = hasMore ? data.slice(0, -1) : data;
            // set the next cursor to the last item if there is more data
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? {
                id: lastItem.id,
                updatedAt: lastItem.updatedAt,
            } : null; 
            return {
                totalCount:totalData[0].count,
                items,
                nextCursor,
            };
        }),
        
})