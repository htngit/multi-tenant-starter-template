"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  Home,
  Package,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Building2,
  Truck,
  ShoppingCart,
  Receipt,
  UserCheck,
  Shield,
  Archive,
  Trash2,
  Factory,
  BookOpen,
  CreditCard,
  Calculator,
  FileBarChart,
  ShoppingBag,
  ClipboardList,
  Quote,
  TrendingUp,
  Lock,
  Cog,
  ChevronUp,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from "@stackframe/stack"
import { UserSettingsDialog } from "@/components/user-settings-dialog"

interface NavigationItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavigationItem[]
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigationSections: NavigationSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    title: "Inventory Management",
    items: [
      {
        title: "Manage Stock",
        icon: Package,
        items: [
          {
            title: "Stock List",
            href: "/inventory/manage-stock/stock-list",
            icon: Archive,
          },
          {
            title: "Stock Opname",
            href: "/inventory/manage-stock/stock-opname",
            icon: ClipboardList,
          },
          {
            title: "Waste Stock",
            href: "/inventory/manage-stock/waste-stock",
            icon: Trash2,
          },
          {
            title: "Production List",
            href: "/inventory/manage-stock/production-list",
            icon: Factory,
          },
          {
            title: "Production Template Recipe",
            href: "/inventory/manage-stock/production-template-recipe",
            icon: BookOpen,
          },
        ],
      },
      {
        title: "Supplier List",
        href: "/inventory/supplier-list",
        icon: Truck,
      },
      {
        title: "Warehouses",
        href: "/inventory/warehouses",
        icon: Building2,
      },
      {
        title: "Stock Movements",
        href: "/inventory/stock-movements",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Financial Management",
    items: [
      {
        title: "Accounts",
        href: "/financial/accounts",
        icon: CreditCard,
      },
      {
        title: "Transactions",
        href: "/financial/transactions",
        icon: DollarSign,
      },
      {
        title: "Tax Management",
        href: "/financial/tax-management",
        icon: Calculator,
      },
    ],
  },
  {
    title: "Document Management",
    items: [
      {
        title: "Invoices",
        href: "/documents/invoices",
        icon: Receipt,
      },
      {
        title: "Purchase Orders",
        href: "/documents/purchase-orders",
        icon: ShoppingBag,
      },
      {
        title: "Quotations",
        href: "/documents/quotations",
        icon: Quote,
      },
    ],
  },
  {
    title: "Party Management",
    items: [
      {
        title: "Customers",
        href: "/parties/customers",
        icon: Users,
      },
      {
        title: "Suppliers",
        href: "/parties/suppliers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Team Management",
    items: [
      {
        title: "Employees",
        href: "/parties/employees",
        icon: UserCheck,
      },
      {
        title: "Custom Right Access",
        href: "/team/custom-right-access",
        icon: Lock,
      },
      {
        title: "Right Access Default",
        href: "/team/right-access-default",
        icon: Shield,
      },
    ],
  },
  {
    title: "Sales & Purchasing",
    items: [
      {
        title: "Sales Orders",
        href: "/sales/orders",
        icon: ShoppingCart,
      },
      {
        title: "Procurement",
        href: "/sales/procurement",
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: "Reporting & Analytics",
    items: [
      {
        title: "Business Intelligence",
        href: "/reports/business-intelligence",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Security & Compliance",
    items: [
      {
        title: "Audit Logs",
        href: "/security/audit-logs",
        icon: Shield,
      },
      {
        title: "Settings",
        href: "/security/settings",
        icon: Settings,
      },
    ],
  },
]

interface AppSidebarProps {
  teamId: string
  teamName: string
}

export function AppSidebar({ teamId, teamName }: AppSidebarProps) {
  const pathname = usePathname()
  const user = useUser()
  
  // Helper function untuk mendapatkan inisial user
  const getUserInitials = () => {
    if (!user?.displayName) return "U"
    return user.displayName
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get avatar URL from Stack Auth metadata or fallback to profileImageUrl
  const getAvatarUrl = () => {
    return user?.clientMetadata?.avatarUrl || user?.profileImageUrl || ''
  }

  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === `/dashboard/${teamId}`) {
      return pathname === `/dashboard/${teamId}`
    }
    return pathname.startsWith(`/dashboard/${teamId}${href}`)
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasSubItems = item.items && item.items.length > 0
    const itemHref = item.href ? `/dashboard/${teamId}${item.href}` : undefined
    const active = itemHref ? isActive(item.href!) : false

    if (hasSubItems) {
      return (
        <Collapsible key={item.title} asChild defaultOpen={active}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={subItem.href ? isActive(subItem.href) : false}
                    >
                      <Link href={`/dashboard/${teamId}${subItem.href}`}>
                        {subItem.icon && <subItem.icon className="h-4 w-4" />}
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
          <Link href={itemHref!}>
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ERP XalesIn</span>
            <span className="truncate text-xs">{teamName}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigationSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => renderNavigationItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserSettingsDialog>
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={getAvatarUrl()}
                    alt={user?.displayName || "User"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.displayName || "User"}
                  </span>
                  <span className="truncate text-xs">
                    {user?.primaryEmail || "user@example.com"}
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </SidebarMenuButton>
            </UserSettingsDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}