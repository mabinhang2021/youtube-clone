import {db} from "@/db";
import {mux} from "@/lib/mux";
import { videos,videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure,} from "@/trpc/init";
import { and,eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UTApi } from "uploadthing/server";


export const videosRouter = createTRPCRouter({
    restoreThumbnail: protectedProcedure
    .input(z.object({
        id: z.string().uuid(),}))
    .mutation(async ({ ctx, input }) => {
        const {id: userId} = ctx.user;
        const [existingVideo] = await db.select().from(videos).where(
            and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            )
        );
        if (!existingVideo) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Video not found or you do not have permission to restore it',
            });
        }
        if (existingVideo.thumbnailKey) {
            const utapi = new UTApi();
            await utapi.deleteFiles(existingVideo.thumbnailKey);
            await db
              .update(videos)
              .set({thumbnailUrl: null, thumbnailKey: null})
              .where(
                and(
                  eq(videos.id, input.id),
                  eq(videos.userId, userId)
                )
              );
          }
        if (!existingVideo.muxPlaybackId) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Video does not have a playback ID',
            });
        }
        const tempthumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg?width=214&height=121&time=3`;
        const utapi = new UTApi();
        const uploadedThumbnail =await utapi.uploadFilesFromUrl( tempthumbnailUrl);
        if (!uploadedThumbnail.data) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to upload thumbnail',
            });
        }
        const {url: thumbnailUrl, key: thumbnailKey} = uploadedThumbnail.data;

        const [updatedVideo] = await db.update(videos).set({thumbnailUrl, thumbnailKey}).where(
            and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            )
        ).returning();
        return updatedVideo; 
    }),
    
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