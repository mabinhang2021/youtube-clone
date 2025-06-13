import {db} from "@/db";
import {mux} from "@/lib/mux";
import { videos,videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure,} from "@/trpc/init";
import { and,eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const videosRouter = createTRPCRouter({
    remove: protectedProcedure
    .input(z.object({
        id: z.string().uuid(),}))
    .mutation(async ({ ctx, input }) => {
        const {id: userId} = ctx.user;
        const [removedVideo] = await db.delete(videos).where(
            and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            )).returning();
        if (!removedVideo) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Video not found or you do not have permission to delete it',
            });
        }
        return removedVideo;
    }),

    update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
        const {id: userId} = ctx.user;
        if (!input.id) {
            throw new TRPCError({code: 'BAD_REQUEST', message: 'Video ID is required'});
        }
        const [updatevideo] = await db.update(videos).set({
            title: input.title,
            description: input.description,
            categoryId: input.categoryId,
            visivility: input.visivility,
            updatedAt: new Date(),
        }).where(
            and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            )
        ).returning();

        if (!updatevideo) {
            throw new TRPCError({
                code: 'NOT_FOUND',});
        }
        return updatevideo;
    }),
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const {id: userId} = ctx.user;

        const upload = await mux.video.uploads.create({
            new_asset_settings:{
                passthrough:userId,
                playback_policy:["public"],
                input:[
                    {
                        generated_subtitles:[{language_code:"en",name:"English"}],
                    }
                ]
                
            },cors_origin:"*",//todo: in production, set this to your frontend URL
        });

        const [video] = await db.insert(videos).values({
            userId,
            title:"Untitled Video",
            muxStatus:"waiting",
            muxUploadId:upload.id,
            
        }).returning();

        return {
            video: video,
            url:upload.url,
        }
    }),
})