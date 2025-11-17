import { Calendar, Command, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"
import { Separator } from "./separator"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/chats",
    icon: Inbox,
    count: 2
  },
  {
    title: "Groups",
    url: "/groups",
    icon: Calendar,
    count: 3
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/AppSettings",
    icon: Settings,
  },
]
const profiles =[
    {
        id: '123',
        image: "/favicon.ico",
        name: "test"
    }
]
const data ={
  name: "Test"
}

export function AppSidebar() {
  return (
    <Sidebar>
          
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/settings">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{data.name}</span>
                  <span className="truncate text-xs">Account</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* <Separator/> */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                 {item.count && <SidebarMenuBadge>{item.count}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarMenu>
            {profiles.map((profile)=>(
                <SidebarMenuItem key={profile.id}>
                    <SidebarMenuButton asChild>
                        <div className="rounded-full bg-gray-400 pt-4 pb-4">
                            <img src={profile.image}/>
                            <a href="/settings" className="text-2xl">
                                {profile.name}
                        </a>
                        </div>
                        
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}

        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  )
}