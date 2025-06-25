"use client"

import { SidebarGroup, SidebarMenu,SidebarGroupContent,SidebarMenuButton,SidebarMenuItem } from "@/components/ui/sidebar"
import {  FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react"
import Link from "next/link"

import { useClerk,useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation"

const items=[
    {
        title: "Home",
        icon: HomeIcon,
        url: "/"
    },
    {
        title: "Subscribed",
        icon: PlaySquareIcon,
        url: "/feed/subscribed",
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
  
    const { isSignedIn } = useAuth();
    const pathname = usePathname();
    return(
        <SidebarGroup>
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
                                }} //todo dosomething on click
                            >
                                <Link prefetch href={item.url} className="flex items-center gap-4">
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