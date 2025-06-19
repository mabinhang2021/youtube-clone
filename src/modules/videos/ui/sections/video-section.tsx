"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPlayer, VideoPlayerSkeleton } from "../components/video-player";
import { cn } from "@/lib/utils";
import { VideoBanner } from "../components/video-banner";
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-toprow";
import { useAuth } from "@clerk/nextjs";


interface VideoSectionProps {
    videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
    return(
        <Suspense fallback={<VideoSectionSkeleton/>} >
            <ErrorBoundary fallback={<p>Something went wrong while loading the video section.</p>}>
                <VideoSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const VideoSectionSkeleton = () => {
    return(
        <>
            <VideoPlayerSkeleton/>
            <VideoTopRowSkeleton/>
        </>
    )

}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
    const {isSignedIn} = useAuth();
    const utils = trpc.useUtils();
    const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
    const createView = trpc.videoViews.create.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId });
        }
    });
    const handlePlay = () => {
        if (!isSignedIn) return;
        createView.mutate({ videoId });
    }

    
    return(
        <>
            <div className={cn("aspect-video bg-black rounded-xl overflow-hidden relative",
                video.muxStatus !== "ready" && "rounded-b-none"
            )}>
                <VideoPlayer autoplay onPlay={handlePlay} playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl}/>
            </div>
            <VideoBanner status ={video.muxStatus}/>
            <VideoTopRow video={video} />
        </>
    )
}