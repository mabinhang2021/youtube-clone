"use client"
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react"
import { SidebarGroup, SidebarMenu,SidebarGroupContent,SidebarMenuButton,SidebarMenuItem,SidebarGroupLabel} from "@/components/ui/sidebar"
import { Flame, FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react"
import Link from "next/link"
import { title } from "process"
import { useClerk,useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation"

const items=[
    {
        title: "History",
        icon: HistoryIcon,
        url: "/playlists/history",
        auth: true
    },
    {
        title: "Liked Videos",
        icon: ThumbsUpIcon,
        url: "/playlists/liked",
        auth: true
    },
    {
        title: "All Playlists",
        icon: ListVideoIcon,
        url: "/playlists",
        auth: true
    },
]

export const PersonalSection = () => {
    const clerk = useClerk();
    const { userId } = useAuth(); 
    const { isSignedIn } = useAuth();
    const pathname = usePathname();
    return(
        <SidebarGroup>
            <SidebarGroupLabel>You</SidebarGroupLabel>   
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={pathname === item.url} //todo: change to look at current pathname
                                onClick={(e) => {
                                    if(item.auth && !isSignedIn) {
                                        e.preventDefault();
                                        return clerk.openSignIn();
                                    }
                                }}  //todo dosomething on click
                            >
                                <Link href={item.url} className="flex items-center gap-4">
                                    <item.icon />
                                    <span className="text-sm">{item.title}</span>
                                
                                </Link>

                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                        
                </SidebarMenu>
                
            </SidebarGroupContent>
        </SidebarGroup>
    )
}