import { toast } from "sonner";
import { useState } from "react";
import { ListPlusIcon, MoreVerticalIcon, ShareIcon, Trash2Icon } from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_URL } from "@/constants";


interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}
//todo:implement the logic for adding to playlist and removing video
export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false);

  const onShare = () => {
    const fullUrl = `${APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
  }

  return (
    <>
    
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>
            <ListPlusIcon className="mr-2 size-4" />
            Add to playlist
          </DropdownMenuItem>
         
            <DropdownMenuItem onClick={() => {}}>
              <Trash2Icon className="mr-2 size-4" />
              Remove
            </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
