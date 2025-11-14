// src/pages/dashboard/DashboardLayout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";

// O Menu do Usuário com o botão Sair
function UserMenu() {
  const { user, logout } = useAuth();
  // const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user ? getInitials(user.name) : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// O Layout Principal
export function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarProvider className="">
        <AppSidebar />
        {/* 2. Conteúdo da Página */}
        <main className="flex-1 p-4 md:p-6">
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}
