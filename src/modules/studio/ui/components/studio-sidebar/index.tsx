"use client"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarMenu, SidebarMenuItem,SidebarMenuButton,SidebarGroup } from "@/components/ui/sidebar"
import { LogOutIcon, VideoIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { StudioSidebarHeader } from "./studio-sidebar-header"

export const StudioSidebar = () => {
    const pathname = usePathname()
    return(
        <Sidebar className="pt-16 z-40 " collapsible="icon">
            <SidebarContent className="bg-background" >
                
                <Separator/>
                <SidebarGroup>
                <SidebarMenu>
                    <StudioSidebarHeader/>
                     <SidebarMenuItem >
                    <SidebarMenuButton asChild isActive={pathname === "/studio"} tooltip="Content" >
                            <Link prefetch href="/studio" >
                                <VideoIcon className = "size-5"/>
                                <span className="text-sm">Content</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <Separator/>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Exit studio" asChild>
                            <Link prefetch href="/">
                                <LogOutIcon className = "size-5"/>
                                <span className="text-sm">Exit studio</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                </SidebarGroup> 
            </SidebarContent>

        </Sidebar>
    )
}