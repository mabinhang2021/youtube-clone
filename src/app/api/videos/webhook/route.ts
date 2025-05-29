import {eq} from "drizzle-orm";
import { VideoAssetCreatedWebhookEvent,VideoAssetErroredWebhookEvent,VideoAssetReadyWebhookEvent,VideoAssetTrackReadyWebhookEvent,VideoAssetDeletedWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";
import {headers} from "next/headers";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";
import { db } from "@/db";
const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;
type WebhookEvent = VideoAssetCreatedWebhookEvent | VideoAssetErroredWebhookEvent | VideoAssetReadyWebhookEvent | VideoAssetTrackReadyWebhookEvent | VideoAssetDeletedWebhookEvent;
export const POST = async ( request:Request) =>{
    if(!SIGNING_SECRET) {
        throw new Error("Mux webhook signing secret is not set");
    }
    const headersPayload = await headers();
    const muxSignature = headersPayload.get("mux-signature");   
    if (!muxSignature) {
        return new Response("Mux signature is missing", { status: 401 });
    }
    const payload = await request.json();
    const body = JSON.stringify(payload);
    mux.webhooks.verifySignature(
        body,
        {
            "mux-signature": muxSignature,
        },SIGNING_SECRET
    );
    switch (payload.type as WebhookEvent ["type"]) {
        case "video.asset.created":{
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];
            if(!data.upload_id) {
                return new Response("Upload ID is missing", { status: 400 });
            }
            console.log("Creating video: ", { uploadId: data.upload_id });
            await db.update(videos).set({
                muxAssetId: data.id,
                muxStatus: data.status,
            }).where(eq(videos.muxUploadId, data.upload_id));
            break;
        }
        case "video.asset.ready":{
            const data = payload.data as VideoAssetReadyWebhookEvent["data"];
            const playbackId = data.playback_ids?.[0]?.id;
            if(!data.upload_id){
                return new Response("Upload ID is missing", { status: 400 });
            }
            if (!playbackId) {
                return new Response("Playback ID is missing", { status: 400 });
            }
            const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=214&height=121&time=3`;
            const previewUrl = `https://image.mux.com/${playbackId}/animated.gif?width=320`;
            const duration =data.duration? Math.round(data.duration *1000):null;


            await db.update(videos).set({
                muxPlaybackId: playbackId,
                thumbnailUrl,
                muxStatus: data.status,
                muxAssetId: data.id,
                previewUrl,
                duration
            }).where(eq(videos.muxUploadId, data.upload_id));
            break;
        }
        case "video.asset.errored":{
            const data = payload.data as VideoAssetErroredWebhookEvent["data"];
            if(!data.upload_id) {
                return new Response("Upload ID is missing", { status: 400 });
            }
            await db.update(videos).set({
                muxStatus: data.status,
             
            }).where(eq(videos.muxUploadId, data.upload_id));
            break;
        }
        case "video.asset.deleted":{
            const data = payload.data as VideoAssetDeletedWebhookEvent["data"];
            if(!data.upload_id) {
                return new Response("Upload ID is missing", { status: 400 });
            }
            console.log("Deleting video: ", { uploadId: data.upload_id });
            await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
            break;
        }
        case "video.asset.track.ready":{
            const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {asset_id: string};
            console.log("Track ready");
            const trackId = data.id;
            const assetId = data.asset_id;
            const status = data.status;
            if(!assetId) {
                return new Response("Asset ID is missing", { status: 400 });
            }
            await db.update(videos).set({
                muxTrackId: trackId,
                muxTrackStatus: status,
            }).where(eq(videos.muxAssetId, assetId));
            break;
            
        }
    }
    return new Response("Webhook received", { status: 200 });




}