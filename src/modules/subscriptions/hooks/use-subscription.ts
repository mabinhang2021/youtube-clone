import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";

import { toast } from "sonner";



interface UseSubscriptionProps {
    userId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
}

export const useSubscription = ({ userId, isSubscribed, fromVideoId }: UseSubscriptionProps) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const subscribe = trpc.subscriptions.create.useMutation({
            onSuccess: () => {
                toast.success("Subscribed successfully");
                //todo: reincalidate subscriptions.getmany , user,getone
                utils.subscriptions.getMany.invalidate();
                utils.videos.getManySubscribed.invalidate();
                utils.users.getOne.invalidate({ id: userId });
                if (fromVideoId) {
                    utils.videos.getOne.invalidate({ id: fromVideoId });
                }
            },
            onError:(error)=>{
                toast.error("Error subscribing");
                if(error.data?.code === "UNAUTHORIZED") {
                    clerk.openSignIn();
                }
            }
        
    })

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: () => {
            toast.success("Unsubscribed successfully");
            utils.subscriptions.getMany.invalidate();
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({ id: userId });
            //todo: reincalidate subscriptions.getmany , user,getone
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
        },
        onError:(error)=>{
            toast.error("Error unsubscribing");
            if(error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });
    
    const isPending = subscribe.isPending || unsubscribe.isPending;

    const onClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({ userId })
        }
        else {
            subscribe.mutate({ userId })
        }
    }
    return {
        onClick,
        isPending,}
}