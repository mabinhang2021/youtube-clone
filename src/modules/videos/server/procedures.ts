import {db} from "@/db";
import {mux} from "@/lib/mux";
import { subscriptions, users, videoReactions, videos,videoUpdateSchema, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure,} from "@/trpc/init";
import { and,desc,eq, getTableColumns, inArray, isNotNull, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/workflow";



export const videosRouter = createTRPCRouter({
  getManySubscribed: protectedProcedure
  .input(
    z.object({
 
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      })
      .nullish(),
      limit: z.number().min(1).max(100),
    }),
  )
  .query(async ({ input,ctx }) => {
    const { cursor, limit, } = input;
    const {id:userId} = ctx.user;

    const viewerSubscriptions = db.$with("viewer_subscriptions").as(
      db.select({
        userId:subscriptions.creatorId,
      }).from(subscriptions)
      .where(eq(subscriptions.viewerId, userId))
    )

    const data = await db
    .with(viewerSubscriptions)
      .select({
        ...getTableColumns(videos),
        user: users,
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        likeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "like"),
        )),
        dislikeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "dislike"),
        )),
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .innerJoin(viewerSubscriptions, eq(viewerSubscriptions.userId, users.id))
      .where(and(
        eq(videos.visibility, "public"),
        userId ? eq(videos.userId, userId) : undefined, 
        cursor
          ? or(
              lt(videos.updatedAt, cursor.updatedAt),
                and(
                  eq(videos.updatedAt, cursor.updatedAt),
                  lt(videos.id, cursor.id)
                )
              )
          : undefined,
      )).orderBy(desc(videos.updatedAt), desc(videos.id))
      // Add 1 to the limit to check if there is more data
      .limit(limit + 1)

    const hasMore = data.length > limit;
    // Remove the last item if there is more data
    const items = hasMore ? data.slice(0, -1) : data;
    // Set the next cursor to the last item if there is more data
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore 
      ? {
        id: lastItem.id,
        updatedAt: lastItem.updatedAt,
      }
      : null;

    return {
      items,
      nextCursor,
    };
  }), 

    getManyTrending: baseProcedure
    .input(
      z.object({
        cursor: z.object({
          id: z.string().uuid(),
          viewCount: z.number(),
        })
        .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit,  } = input;

      const viewCountSubquery = db.$count(videoViews, eq(videoViews.videoId, videos.id));

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: viewCountSubquery,
          likeCount: db.$count(videoReactions, and(
            eq(videoReactions.videoId, videos.id),
            eq(videoReactions.type, "like"),
          )),
          dislikeCount: db.$count(videoReactions, and(
            eq(videoReactions.videoId, videos.id),
            eq(videoReactions.type, "dislike"),
          )),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(and(
          eq(videos.visibility, "public"),
          
          cursor
            ? or(
                lt(viewCountSubquery, cursor.viewCount),
                  and(
                    eq(viewCountSubquery, cursor.viewCount),
                    lt(videos.id, cursor.id)
                  )
                )
            : undefined,
        )).orderBy(desc(viewCountSubquery), desc(videos.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      const hasMore = data.length > limit;
      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore 
        ? {
          id: lastItem.id,
          viewCount: lastItem.viewCount,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }), 
    getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(),
        userId: z.string().uuid().nullish(),
        cursor: z.object({
          id: z.string().uuid(),
          updatedAt: z.date(),
        })
        .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit, categoryId, userId } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(videoReactions, and(
            eq(videoReactions.videoId, videos.id),
            eq(videoReactions.type, "like"),
          )),
          dislikeCount: db.$count(videoReactions, and(
            eq(videoReactions.videoId, videos.id),
            eq(videoReactions.type, "dislike"),
          )),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(and(
          eq(videos.visibility, "public"),
          userId ? eq(videos.userId, userId) : undefined,
          categoryId ? eq(videos.categoryId, categoryId) : undefined,
          cursor
            ? or(
                lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
            : undefined,
        )).orderBy(desc(videos.updatedAt), desc(videos.id))
        // Add 1 to the limit to check if there is more data
        .limit(limit + 1)

      const hasMore = data.length > limit;
      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore 
        ? {
          id: lastItem.id,
          updatedAt: lastItem.updatedAt,
        }
        : null;

      return {
        items,
        nextCursor,
      };
    }), 
    getOne:baseProcedure
    .input(z.object({id: z.string().uuid(),}))
    .query(async ({ ctx, input }) => {
        const {clerkUserId} = ctx;
        let userId
        const [user] = await db.select().from(users).where(inArray(users.clerkId,clerkUserId ? [clerkUserId] :[]));
        if(user){
            userId = user.id;
        }
        const viewerReactions = db.$with("viewer_reactions").as(
            db.select({
                videoId: videoReactions.videoId,
                type: videoReactions.type,}).from(videoReactions)
                .where(inArray(videoReactions.userId, userId ? [userId] : []))
        )

        const viewerSubscriptions = db.$with("viewer_subscriptions").as(
            db.select().
            from(subscriptions)
            .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
        )

        const [existingVideo] = await db.with(viewerReactions,viewerSubscriptions).select(
            {
                ...getTableColumns(videos),
                user:{
                    ...getTableColumns(users),
                    subscriberCount: db.$count(subscriptions,
                        eq(subscriptions.creatorId, users.id),
                    ),
                    viewerSubscribed:isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean)
                },
                viewCount:db.$count(videoViews,eq(videoViews.videoId, videos.id)),
                likeCount:db.$count(videoReactions,
                    and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, 'like'),
                    )
                ),
                dislikeCount:db.$count(videoReactions,
                    and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, 'dislike'),
                    )
                ),
                viewerReaction: viewerReactions.type,
            },
        )
        .from(videos).
        innerJoin(users,eq(videos.userId,users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, videos.userId))
        .where(eq(videos.id, input.id))
       .groupBy(videos.id, users.id, viewerReactions.type, viewerSubscriptions.viewerId);


        if (!existingVideo) {
            throw new TRPCError({code: 'NOT_FOUND',});
        }
        return existingVideo;
    }),

    generateTitle: protectedProcedure
    .input(z.object({
        id: z.string().uuid(),}))
      .mutation(async ({ctx,input}) =>{
        const {id: userId} = ctx.user;
        const {workflowRunId } = await workflow.trigger({
            url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
            body: {userId,videoId: input.id},
            retries: 3,
        })
        return workflowRunId;
      }),
      generateDescription: protectedProcedure
      .input(z.object({
          id: z.string().uuid(),}))
        .mutation(async ({ctx,input}) =>{
          const {id: userId} = ctx.user;
          const {workflowRunId } = await workflow.trigger({
              url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
              body: {userId,videoId: input.id},
              retries: 3,
          })
          return workflowRunId;
        }),
      
    generateThumbnail: protectedProcedure
    .input(z.object({
        id: z.string().uuid(),prompt: z.string().min(10),}))
      .mutation(async ({ctx,input}) =>{
        const {id: userId} = ctx.user;
        const {workflowRunId } = await workflow.trigger({
            url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
            body: {userId,videoId: input.id,prompt: input.prompt},
            retries: 3,
        })
        return workflowRunId;
      }),
    revalidate: protectedProcedure
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
            throw new TRPCError({code:"UNAUTHORIZED"})
        }
        if(!existingVideo.muxUploadId){
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Video does not have a Mux upload ID',
            });
        }
        const upload = await mux.video.uploads.retrieve(existingVideo.muxUploadId);
        if(!upload || !upload.asset_id){
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Video does not have a Mux upload ID',
            });
        }
        const asset = await mux.video.assets.retrieve(upload.asset_id);
        if(!asset){throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Video does not have a Mux asset ID',
        });}

        const playbackId = asset.playback_ids?.[0].id;
        const duration = asset.duration ? Math.round(asset.duration *1000) : 0;

        //TODO: FIND A WAY TO RECALIDATE TRACKID AND TRACKSTATUS
        
        const [updatedVideo] = await db.update(videos).set({
            muxStatus: asset.status,
            muxPlaybackId:playbackId,
            muxAssetId: asset.id,
            duration
        }).where(
            and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            )
        )
        .returning()

        return updatedVideo;
       

    }),

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
           visibility: input.visibility,
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