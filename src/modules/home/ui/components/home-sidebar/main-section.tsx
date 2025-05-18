"use client"

import { SidebarGroup, SidebarMenu,SidebarGroupContent,SidebarMenuButton,SidebarMenuItem } from "@/components/ui/sidebar"
import { Flame, FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react"
import Link from "next/link"
import { title } from "process"
import { useClerk,useAuth } from "@clerk/nextjs";

const items=[
    {
        title: "Home",
        icon: HomeIcon,
        url: "/"
    },
    {
        title: "Subscriptions",
        icon: PlaySquareIcon,
        url: "/feed/subscriptions",
        auth: true
    },
    {
        title: "Trending",
        icon: FlameIcon,
        url: "/feed/trending",
    },
]

export const MainSection = () => {
    const clerk = useClerk();
    const { userId } = useAuth(); 
    const { isSignedIn } = useAuth();
    return(
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={false} //todo: change to look at current pathname
                                onClick={(e) => {
                                    if(item.auth && !isSignedIn) {
                                        e.preventDefault();
                                        return clerk.openSignIn();
                                    }
                                }} //todo dosomething on click
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