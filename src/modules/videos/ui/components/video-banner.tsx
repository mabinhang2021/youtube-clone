import { AlertTriangleIcon } from "lucide-react";
import { VideoGetOneOutput } from "@/modules/videos/types";

interface VideoBannerProps {
    status: VideoGetOneOutput["muxStatus"];
}

export const VideoBanner = ({ status }: VideoBannerProps) => {
    if (status === "ready") {
        return null;
    }
    return (
        <div className="bg-yellow-500 py-3 px-4 rounded-b-xl flex items-center gap-2">
            <AlertTriangleIcon className="size-4 text-black shrink-0"/>
            <p className=" text-xs md:text-sm text-black line-clamp-1 font-medium">
                This video is still processing. It may take a few minutes before it is ready to watch.
            </p>

        </div>
    )
}