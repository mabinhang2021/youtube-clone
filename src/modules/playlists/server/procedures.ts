import {db} from "@/db";
import {mux} from "@/lib/mux";
import { subscriptions, users, videos,videoUpdateSchema, videoReactions, playlistVideos, playlists, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure,} from "@/trpc/init";
import { and,desc,eq, getTableColumns, inArray, isNotNull, lt, or, sql } from "drizzle-orm";

import { z } from "zod";
import { create } from "domain";



export const playlistsRouter = createTRPCRouter({
  removeVideo: protectedProcedure
  .input(z.object({
    playlistId: z.string().uuid(),
    videoId: z.string().uuid(),
  }

  ))
  .mutation(async ({ input, ctx }) => {
    const { playlistId,videoId } = input;
    const {id: userId} = ctx.user;
    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(and(eq(playlists.id, playlistId),eq(playlists.userId, userId)));

    if (!existingPlaylist) {
      throw new Error("Playlist not found");
    }
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, videoId));
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    const [existingPlaylistVideo] = await db
      .select()
      .from(playlistVideos)
      .where(and(
        eq(playlistVideos.playlistId, playlistId),
        eq(playlistVideos.videoId, videoId)
      ))
    if (!existingPlaylistVideo) {
      throw new Error("Not found in the playlist");
    }
    const [deletedPlaylistVideo] = await db
      .delete(playlistVideos)
      .where(and(
        eq(playlistVideos.playlistId, playlistId),
        eq(playlistVideos.videoId, videoId)
        ))
      .returning();
    return deletedPlaylistVideo;
  }),
  addVideo: protectedProcedure
    .input(z.object({
      playlistId: z.string().uuid(),
      videoId: z.string().uuid(),
    }

    ))
    .mutation(async ({ input, ctx }) => {
      const { playlistId,videoId } = input;
      const {id: userId} = ctx.user;
      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId),eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new Error("Playlist not found");
      }
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));
      if (!existingVideo) {
        throw new Error("Video not found");
      }
      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(and(
          eq(playlistVideos.playlistId, playlistId),
          eq(playlistVideos.videoId, videoId)
        ))
      if (existingPlaylistVideo) {
        throw new Error("Video already exists in the playlist");
      }
      const [createdPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();
      return createdPlaylistVideo;
    }),
  getManyForVideo: protectedProcedure
  .input(
    z.object({
      videoId: z.string().uuid(),
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      })
      .nullish(),
      limit: z.number().min(1).max(100),
    }),
  )
  .query(async ({ input,ctx }) => {
    const { cursor, limit, videoId } = input;
    const {id: userId} = ctx.user;   
    const data = await db
      .select({
        ...getTableColumns(playlists),
        videoCount: db.$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id)),
        user:users,
        containsVideo:videoId
          ? sql<boolean>`(
            SELECT EXISTS (
              SELECT 1
              FROM ${playlistVideos} pv
              WHERE pv.playlist_id = ${playlists.id} AND pv.video_id= ${videoId}
            )
          )`
          : sql<boolean>`false`,
      })
      .from(playlists)
      .innerJoin(users, eq(playlists.userId, users.id))
      .where(and(
        eq(playlists.userId, userId),
        
        cursor
          ? or(
              lt(playlists.updatedAt, cursor.updatedAt),
                and(
                  eq(playlists.updatedAt, cursor.updatedAt),
                  lt(playlists.id, cursor.id)
                )
              )
          : undefined,
      )).orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
  getMany: protectedProcedure
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
    const { cursor, limit,  } = input;
    const {id: userId} = ctx.user;   
    const data = await db
      .select({
        ...getTableColumns(playlists),
        videoCount: db.$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id)),
        user:users,
        thumbnailurl: sql<string | null>`(
        SELECT v.thumbnail_url
        FROM ${playlistVideos} pv
        JOIN ${videos} v ON pv.video_id = v.id
        WHERE pv.playlist_id = ${playlists.id}
        ORDER BY pv.updated_at DESC
        LIMIT 1
        )`
      })
      .from(playlists)
      .innerJoin(users, eq(playlists.userId, users.id))
      .where(and(
        eq(playlists.userId, userId),
        
        cursor
          ? or(
              lt(playlists.updatedAt, cursor.updatedAt),
                and(
                  eq(playlists.updatedAt, cursor.updatedAt),
                  lt(playlists.id, cursor.id)
                )
              )
          : undefined,
      )).orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
  create: protectedProcedure
    .input(z.object({name: z.string().min(1).max(100)}))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      const {id: userId} = ctx.user;
      const [createdPlaylist] = await db
        .insert(playlists)
        .values({
          name,
          userId,
        })
        .returning();
        if (!createdPlaylist) {
          throw new Error("Failed to create playlist");
        }
        return createdPlaylist;
    }),
  getLiked: protectedProcedure
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
    const { cursor, limit,  } = input;
    const {id: userId} = ctx.user;

    const playlists =db.$with("viewer_video_reactions").as(
      db.select({
        videoId: videoReactions.videoId,
        updatedAt: videoReactions.updatedAt,
      })
      .from(videoReactions)
      .where(and(
        eq(videoReactions.userId, userId),
        eq(videoReactions.type, "like")
      ))
    )

    const data = await db
    .with(playlists)
      .select({
        ...getTableColumns(videos),
        user: users,
        updatedAt:playlists.updatedAt,
        viewCount: db.$count(videoReactions, eq(videoReactions.videoId, videos.id)),
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
      .innerJoin(playlists, eq(playlists.videoId, videos.id))
      .leftJoin(videoReactions, eq(playlists.videoId, videos.id))
      .where(and(
        eq(videos.visibility, "public"),
        
        cursor
          ? or(
              lt(playlists.updatedAt, cursor.updatedAt),
                and(
                  eq(playlists.updatedAt, cursor.updatedAt),
                  lt(videos.id, cursor.id)
                )
              )
          : undefined,
      )).orderBy(desc(playlists.updatedAt), desc(videos.id))
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
  
    getHistory: protectedProcedure
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
      const { cursor, limit,  } = input;
      const {id: userId} = ctx.user;

      const playlists =db.$with("viewer_video_views").as(
        db.select({
          videoId: videoReactions.videoId,
          updatedAt: videoReactions.updatedAt,
        })
        .from(videoReactions)
        .where(eq(videoReactions.userId, userId))
      )

      const data = await db
      .with(playlists)
        .select({
          ...getTableColumns(videos),
          user: users,
          updatedAt:playlists.updatedAt,
          viewCount: db.$count(videoReactions, eq(videoReactions.videoId, videos.id)),
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
        .innerJoin(playlists, eq(playlists.videoId, videos.id))
        .leftJoin(videoReactions, eq(playlists.videoId, videos.id))
        .where(and(
          eq(videos.visibility, "public"),
          
          cursor
            ? or(
                lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
            : undefined,
        )).orderBy(desc(playlists.updatedAt), desc(videos.id))
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
    getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        cursor: z.object({
          id: z.string().uuid(),
          updatedAt: z.date(),
        })
        .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ input,ctx }) => {
      const { cursor, limit, playlistId } = input;
      const {id: userId} = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId),eq(playlists.userId, userId)));
      if (!existingPlaylist) {
        throw new Error("Playlist not found");
        }

      const videosFromPlaylist =db.$with("playlist_videos").as(
        db.select({
          videoId: playlistVideos.videoId,
      
        })
        .from(playlistVideos)
        .where(eq(playlistVideos.playlistId, playlistId))
      )

      const data = await db
      .with(videosFromPlaylist)
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
        .innerJoin(videosFromPlaylist, eq(videosFromPlaylist.videoId, videos.id))
   
        .where(and(
          eq(videos.visibility, "public"),
          
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
    getOne:protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input,ctx }) => {
      const { id } = input;
      const {id: userId} = ctx.user;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, id),eq(playlists.userId, userId))); 
      if (!existingPlaylist) {
        throw new Error("Playlist not found");
      }
      return existingPlaylist;
    }),
    remove:protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input,ctx }) => {
      const { id } = input;
      const {id: userId} = ctx.user;
      
      const [deletedPlaylist] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, id),eq(playlists.userId, userId)))
        .returning();
      if (!deletedPlaylist) {
        throw new Error("Playlist not found");
      }
      return deletedPlaylist;
    }),
   
    

})