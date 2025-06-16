import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Thumb } from "@radix-ui/react-scroll-area"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
//todo: replace with actual logic to determine viewer's reaction

export const VideoReactions = () => {
    const viewerReactions :"like" | "dislike" = "like"; // This should be replaced with actual logic to determine the viewer's reaction
    return(
        <div className="flex items-center flex-none">
            <Button variant="secondary" className="rounded-l-full rounded-r-none gap-2 pr-4">
                <ThumbsUpIcon className={cn("size-5",viewerReactions === "like" && "fill-black")}/>
                {1}
            </Button>
            <Separator orientation="vertical" className="h-7"/>
            <Button variant="secondary" className="rounded-l-none rounded-r-full gap-2 pr-4">
                <ThumbsDownIcon className={cn("size-5",viewerReactions !== "like" && "fill-black")}/>
                {1}
            </Button>

        </div>
    )
}