import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { VideoGetOneOutput } from "@/modules/videos/types";
import { useAuth } from "@clerk/nextjs";

import Link from "next/link";

interface VideoOwnerProps {
    user: VideoGetOneOutput["user"];
    videoId: VideoGetOneOutput["id"];
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
    const {userId:clerkUserId, isLoaded} = useAuth();

    const {isPending,onClick} = useSubscription({
        userId: user.id,
        isSubscribed: user.viewerSubscribed,
        fromVideoId: videoId,
    });
    return (
        <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
            <Link prefetch href={`/users/${user.id}`} >
                <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar size="lg" imageUrl={user.imageUrl} name={user.name} />
                    <div className="flex flex-col min-w-0 gap-1">
                        <UserInfo size="lg" name={user.name}/>
                        <span className="text-sm text-muted-foreground line-clamp-1">
                            {user.subscriberCount} subscribers
                            
                        </span>
                    </div>
                </div>

            </Link>
            {clerkUserId === user.clerkId ? (
                <Button variant="secondary"  className="rounded-full" asChild>
                    <Link prefetch href={`/videos/${videoId}/edit`}>Edit Video</Link>
                </Button>
            ):(
                <SubscriptionButton  disabled={isPending || !isLoaded} isSubscribed={user.viewerSubscribed} onClick={onClick} className="flex-none"/>
            )}
        </div>
    )
}