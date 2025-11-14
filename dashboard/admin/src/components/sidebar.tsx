import { Inbox, Package2, ChartNoAxesCombined, Flag, ShoppingBasket, ChevronDown, Gavel, Users, ListChecks } from "lucide-react";
import logo from "../assets/logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
} from "./ui/sidebar";

// Menu items.
const items = [
  {
    title: "Ofertas",
    url: "/offers",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Criar Oferta",
    url: "/offers/new",
    icon: ShoppingBasket,
  },
  {
    title: "DashBoard",
    url: "/dashboard",
    icon: Inbox,
  },
];

// const approvalItems = [
//   {
//     title: "Usuários",
//     url: "/pending-users-approvals",
//     icon: Users,
//   },
//   {
//     title: "Leilões",
//     url: "/pending-auctions-approvals",
//     icon: Gavel,
//   },
// ];

export function AppSidebar() {
  // const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <img src={logo} alt="logo" className="mt-12 mb-10 w-[40%]" />
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
                </SidebarMenuItem>
              ))}

              {/* <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsApprovalOpen(!isApprovalOpen)} className="cursor-pointer">
                  <ListChecks />
                  <span>Aprovações</span>
                  <ChevronDown className={`ml-auto transition-transform duration-200 ${isApprovalOpen ? "rotate-180" : ""}`} />
                </SidebarMenuButton>

                {isApprovalOpen && (
                  <SidebarMenuSub>
                    {approvalItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <subItem.icon />
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
