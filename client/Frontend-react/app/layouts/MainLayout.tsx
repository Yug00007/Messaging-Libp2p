import React from 'react'
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"
import { AppSidebar } from "../components/ui/app-sidebar"
import { Outlet } from 'react-router'
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='font-serif '>
        <SidebarProvider  >
            <AppSidebar />
            <main className="w-full  bg-black">
                <SidebarTrigger variant={'secondary'} />
                <Outlet/>
            </main>
        </SidebarProvider>
    </div>
  )
}

export default MainLayout