import { ResponsiveModal } from "@/components/responsive-modal";

import { trpc } from "@/trpc/client";


import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { DEFAULT_LIMIT } from "@/constants";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface PlaylistAddModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoId:string;
}



export const PlaylistAddModal = ({
    videoId,
    open,
    onOpenChange,
}: PlaylistAddModalProps) => {
    const utils = trpc.useUtils();
    const {data:playlists,isLoading,hasNextPage,isFetchingNextPage,fetchNextPage} = trpc.playlists.getManyForVideo.useInfiniteQuery({
        limit:DEFAULT_LIMIT,videoId
    },{
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: !!videoId && open,
    })

    const addVideo = trpc.playlists.addVideo.useMutation({
        onSuccess: (data) => {
            toast.success("video added to playlist")
            utils.playlists.getMany.invalidate()
            utils.playlists.getManyForVideo.invalidate({videoId})
            //todo: invalidate playlists.getone
            utils.playlists.getOne.invalidate({id:data.playlistId})
            utils.playlists.getVideos.invalidate({playlistId:data.playlistId})
        },
        onError: (err) => {
            toast.error(err.message || "Failed to add video to playlist")
        }
    })
    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess: (data) => {
            toast.success("video removed from playlist")
            utils.playlists.getMany.invalidate()
            utils.playlists.getManyForVideo.invalidate({videoId})
            //todo: invalidate playlists.getone
            utils.playlists.getOne.invalidate({id:data.playlistId})
            utils.playlists.getVideos.invalidate({playlistId:data.playlistId})
        },
        onError: (err) => {
            toast.error(err.message || "Failed to remove video from playlist")
        }
    })

  
    
    return (
        <ResponsiveModal title="Add  to playlist"
            open={open}
            onOpenChange={onOpenChange}>
            <div className="flex flex-col gap-2">
                {isLoading && (
                    <div className="flex justify-center p-4">
                        <Loader2Icon className="size-5 animate-spin text-muted-foreground"/>
                    </div>
                )}
                {!isLoading && 
                    playlists?.pages.flatMap((page)=>page.items)
                    .map((playlist) => (
                        <Button key={playlist.id} variant="ghost" size="lg"
                        className="w-full justify-start px-2 [&_svg]:size-5"
                        onClick={() => {
                            if(playlist.containsVideo){
                                removeVideo.mutate({playlistId:playlist.id,videoId})
                            }else{
                                addVideo.mutate({playlistId:playlist.id,videoId})
                            }
                        }} disabled={removeVideo.isPending || addVideo.isPending}>
                            {playlist.containsVideo ?(
                                <SquareCheckIcon className="mr-2" />
                            ):(<SquareIcon className="mr-2" />)}
                            {playlist.name} ({playlist.videoCount})
                        </Button>
                    ))
                }
                {!isLoading &&(
                    <InfiniteScroll
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        isManual
                        />
                )}
            </div>
        </ResponsiveModal>
    )
}