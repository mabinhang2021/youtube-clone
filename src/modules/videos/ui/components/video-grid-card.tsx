import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];

  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return(
    <div className="flex flex-col gap-2 w-full ">
      <VideoThumbnailSkeleton/>
      <VideoInfoSkeleton/>
    </div>
  )

}

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
        <Link prefetch href={`/videos/${data.id}`}>
            <VideoThumbnail imageUrl={data.thumbnailUrl} 
            title={data.title} previewUrl={data.previewUrl} duration={data.duration ?? 0} />
        </Link>
        <VideoInfo data={data} onRemove={onRemove}/>
    </div>


)}