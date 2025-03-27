import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Home,
  ShoppingBag,
  Menu,
  BarChart2,
  Settings,
  LogOut,
  CreditCard,
  Printer,
  Truck,
  Sliders,
  LayoutGrid,
  Tablet,
  Package,
  CreditCard as PaymentIcon,
  Laptop,
  Utensils,
  Monitor,
} from "lucide-react";

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

const Sidebar = ({
  activePage = "orders",
  onNavigate = () => {},
  userName = "Jane Doe",
  userRole = "Store Manager",
  userAvatar = "",
}: SidebarProps) => {
  const navItems = [
    {
      id: "orders",
      label: "Order Queue",
      icon: <ShoppingBag className="mr-2 h-5 w-5" />,
    },
    {
      id: "pos",
      label: "POS Terminal",
      icon: <CreditCard className="mr-2 h-5 w-5" />,
    },
    {
      id: "menu",
      label: "Menu Management",
      icon: <Menu className="mr-2 h-5 w-5" />,
    },
    {
      id: "tables",
      label: "Table Management",
      icon: <LayoutGrid className="mr-2 h-5 w-5" />,
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: <BarChart2 className="mr-2 h-5 w-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-5 w-5" />,
      subItems: [
        {
          id: "kitchen-display",
          label: "Kitchen Display",
          icon: <Utensils className="mr-2 h-4 w-4" />,
        },
        {
          id: "ipad-pos",
          label: "iPad POS Integration",
          icon: <Tablet className="mr-2 h-4 w-4" />,
        },
        {
          id: "cds-interface",
          label: "Customer Display System",
          icon: <Monitor className="mr-2 h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <div className="flex h-full w-[280px] flex-col bg-background border-r p-4">
      <div className="flex items-center gap-2 py-4">
        <div className="rounded-full bg-primary p-1">
          <Home className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold">Xuan Tea POS</h1>
      </div>
      <Separator className="my-4" />
      <div className="flex-1 space-y-2">
        {navItems.map((item) => (
          <React.Fragment key={item.id}>
            <Button
              variant={activePage === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              {item.label}
            </Button>
            {item.subItems && activePage === item.id && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Button
                    key={subItem.id}
                    variant={activePage === subItem.id ? "secondary" : "ghost"}
                    className="w-full justify-start py-1.5 text-sm"
                    onClick={() => onNavigate(subItem.id)}
                    size="sm"
                  >
                    {subItem.icon}
                    {subItem.label}
                  </Button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <Separator className="my-4" />
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 w-full justify-start"
          size="sm"
          onClick={() => (window.location.href = "/landing")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
