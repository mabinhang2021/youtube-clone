"use client";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
    playbackId: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    autoplay?: boolean;
    onPlay?: () => void;
}
export const VideoPlayerSkeleton = () => {
    return <div className="aspect-video bg-black rounded-xl" />
  };
export const VideoPlayer = ({
    playbackId,
    thumbnailUrl,
    autoplay,
    onPlay,
}: VideoPlayerProps) => {
    if(!playbackId) return null;
    return(
        <MuxPlayer 
            playbackId={playbackId}
            poster={thumbnailUrl || undefined}
            playerInitTime={0} // Start the player immediately
            autoPlay={autoplay}
            thumbnailTime={0} // Show thumbnail at the start
            className="w-full h-full object-contain"
            accentColor="#FF2056"
            onPlay={onPlay}
           
           
        />
    )


}