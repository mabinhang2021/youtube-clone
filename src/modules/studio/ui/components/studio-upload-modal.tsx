"use client"

import { Button } from "@/components/ui/button"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { StudioUploader } from "@/modules/studio/ui/components/studio-uploader";
import { ResponsiveModal } from "@/components/responsive-modal";
export const StudioUploadModal = () => {
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess:()=>{
            toast.success("Video created");
            utils.studio.getMany.invalidate();
        },
        onError:(error)=>{
            toast.error(`Failed to create video: ${error.message}`);
        },
    }
    );

    return (
        <>
        <ResponsiveModal title="upload a video" open={!!create.data?.url} onOpenChange={()=>create.reset()}>
            { create.data?.url ? 
                <StudioUploader  endpoint={create.data.url} onSuccess={()=>{}}/> :
                <Loader2Icon/>
            } 
        </ResponsiveModal>
        <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending? <Loader2Icon className="animate-spin"/>:<PlusIcon/>}

            
            Create
        </Button>
        </>
    )
}