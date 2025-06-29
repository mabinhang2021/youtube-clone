import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
export const StudioSidebarHeader = () => {

    const {user} = useUser()
    const {state} =useSidebar()
    if(!user) {
        return (
            <SidebarHeader className="flex items-center justify-center pb-4">
                <Skeleton className="size-[112px] rounded-full"/>
                <div  className="flex flex-col items-center mt-2 gap-y-1">
                    <Skeleton className="w-[80px] h-4 "/>
                    <Skeleton className="w-[100px] h-4 "/>
                </div>
            </SidebarHeader>
        )
    }

    if(state === "collapsed") {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Your Profile" asChild>
                    <Link prefetch href="/users/current">
                        <UserAvatar imageUrl={user.imageUrl} name={user.fullName?? "user"} size="xs"/>
                        <span className="text-sm">Your profile</span>
                    </Link>
                   
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link prefetch href="/users/current">
               <UserAvatar imageUrl={user?.imageUrl} name={user?.fullName?? "user"} 
               className="size-[112px] hover:opacity-80 transition-opacity"/>
            </Link>
            <div className="flex flex-col items-center mt-2 gap-y-1">
                <p className="text-sm font-medium">Your Profile</p>
                <p className=" text-xs text-muted-foreground">{user.fullName}</p>
            </div>
        </SidebarHeader>
    )
}