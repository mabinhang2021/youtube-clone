import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createTRPCClient } from "@trpc/client";
import { db } from "@/db";
import { commentReactions, comments, users, videos, videoViews } from "@/db/schema";
import { z } from "zod";
import { eq ,and,or,lt, desc, getTableColumns,} from "drizzle-orm";
import { TRPCError } from "@trpc/server";


export const studioRouter = createTRPCRouter({

    getOne:protectedProcedure
        .input(z.object({id:z.string().uuid()}))
        .query(async({ctx, input})=>{
            const {id} = input;
            const {id:userId} = ctx.user;
            const [video] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, id),
                    eq(videos.userId, userId)
                ))
            if(!video) throw new TRPCError({code:"NOT_FOUND"});
            return video;
        }),
    getMany:protectedProcedure.input(
        z.object({
            cursor:z.object({
                id:z.string().uuid(),
                updatedAt:z.date(),
            }).nullish(),
            limit:z.number().min(1).max(100),
        }))
    .query(async({ctx, input})=>{
        const { cursor, limit } = input;
        const {id:userId} = ctx.user;
        const data = await db
            .select({
                ...getTableColumns(videos),
                user:users,
                viewCount:db.$count(videoViews,eq(videoViews.videoId, videos.id)),
                commentCount:db.$count(comments, eq(comments.videoId, videos.id)),
                likeCount:db.$count(commentReactions,and(
                    eq(commentReactions.commentId, comments.id),
                    eq(commentReactions.type, "like")
                )),
                dislikeCount:db.$count(commentReactions,and(
                    eq(commentReactions.commentId, comments.id),
                    eq(commentReactions.type, "dislike")
                )),
            })
            .from(videos)
            .innerJoin(users, eq(videos.userId, users.id))
            .where(and(
                eq(videos.userId, userId),
                cursor ? or(
                    lt(videos.updatedAt, cursor.updatedAt),
                    and(
                        eq(videos.updatedAt, cursor.updatedAt),
                        lt(videos.id, cursor.id)
                    )
                ) : undefined
            )).orderBy( desc(videos.updatedAt), desc(videos.id)).limit(limit + 1)
            //add 1 to the limit to check if there is more data
            const hasMore = data.length > limit;
            //remove the last item if there is more data
            const items = hasMore ? data.slice(0, -1) : data;
            //set the next cursot to the last item if there is more data
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ? {
                id:lastItem.id,
                updatedAt:lastItem.updatedAt,
            }:null;

        return {
            items,
            nextCursor,
        }
    }),
});