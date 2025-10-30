/**
 * Main Layout
 * Layout with shadcn/ui sidebar navigation for authenticated pages
 */
import React from 'react';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from './AppSidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar';
import { Separator } from '../ui/separator';

export function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-x-hidden">
        {/* Header with trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h2 className="text-sm font-semibold">StandupMate</h2>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

