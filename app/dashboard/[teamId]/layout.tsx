'use client';

import SidebarLayout, { SidebarItem } from "@/components/sidebar-layout";
import { SelectedTeamSwitcher, useUser } from "@stackframe/stack";
import { 
  BarChart4, 
  Building2, 
  Calculator, 
  FileText, 
  Globe, 
  Package, 
  Settings2, 
  Shield, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Warehouse,
  CreditCard,
  Receipt,
  FileBarChart,
  UserCheck,
  ShoppingBag,
  Truck,
  ClipboardList,
  FileInput,
  FileOutput,
  DollarSign,
  RotateCcw,
  Boxes,
  ClipboardCheck,
  Trash2,
  Factory,
  BookOpen
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const navigationItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Globe,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Inventory Management',
  },
  {
    name: "Purchasing",
    href: "/inventory/purchasing",
    icon: ShoppingBag,
    type: "group",
    children: [
      {
        name: "Product Request",
        href: "/inventory/purchasing/product-request",
        icon: ClipboardList,
        type: "item",
      },
      {
        name: "Purchase Order (PO)",
        href: "/inventory/purchasing/purchase-order",
        icon: FileInput,
        type: "item",
      },
      {
        name: "Purchase Delivery",
        href: "/inventory/purchasing/purchase-delivery",
        icon: Truck,
        type: "item",
      },
      {
        name: "Purchase Invoice",
        href: "/inventory/purchasing/purchase-invoice",
        icon: Receipt,
        type: "item",
      },
      {
        name: "Invoice Payment",
        href: "/inventory/purchasing/invoice-payment",
        icon: DollarSign,
        type: "item",
      },
      {
        name: "Returns",
        href: "/inventory/purchasing/returns",
        icon: RotateCcw,
        type: "item",
      },
    ],
  },
  {
    name: "Manage Stock",
    href: "/inventory/stock",
    icon: Boxes,
    type: "group",
    children: [
      {
        name: "Stock List",
        href: "/inventory/stock/stock-list",
        icon: Package,
        type: "item",
      },
      {
        name: "Stock Opname",
        href: "/inventory/stock/stock-opname",
        icon: ClipboardCheck,
        type: "item",
      },
      {
        name: "Waste Stock",
        href: "/inventory/stock/waste-stock",
        icon: Trash2,
        type: "item",
      },
      {
        name: "Production List",
        href: "/inventory/stock/production-list",
        icon: Factory,
        type: "item",
      },
      {
        name: "Production Template Recipe",
        href: "/inventory/stock/production-template",
        icon: BookOpen,
        type: "item",
      },
    ],
  },
  {
    name: "Supplier List",
    href: "/inventory/suppliers",
    icon: Users,
    type: "item",
  },
  {
    name: "Warehouses",
    href: "/inventory/warehouses",
    icon: Warehouse,
    type: "item",
  },
  {
    name: "Stock Movements",
    href: "/inventory/movements",
    icon: TrendingUp,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Financial Management',
  },
  {
    name: "Accounts",
    href: "/financial/accounts",
    icon: CreditCard,
    type: "item",
  },
  {
    name: "Transactions",
    href: "/financial/transactions",
    icon: Receipt,
    type: "item",
  },
  {
    name: "Tax Management",
    href: "/financial/tax",
    icon: Calculator,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Document Management',
  },
  {
    name: "Invoices",
    href: "/documents/invoices",
    icon: FileText,
    type: "item",
  },
  {
    name: "Purchase Orders",
    href: "/documents/purchase-orders",
    icon: ShoppingBag,
    type: "item",
  },
  {
    name: "Quotations",
    href: "/documents/quotations",
    icon: FileBarChart,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Party Management',
  },
  {
    name: "Customers",
    href: "/parties/customers",
    icon: Users,
    type: "item",
  },
  {
    name: "Suppliers",
    href: "/parties/suppliers",
    icon: Truck,
    type: "item",
  },
  {
    name: "Employees",
    href: "/parties/employees",
    icon: UserCheck,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Sales & Purchasing',
  },
  {
    name: "Sales Orders",
    href: "/sales/orders",
    icon: ShoppingCart,
    type: "item",
  },
  {
    name: "Procurement",
    href: "/sales/procurement",
    icon: Building2,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Reporting & Analytics',
  },
  {
    name: "Business Intelligence",
    href: "/reports/business-intelligence",
    icon: BarChart4,
    type: "item",
  },
  {
    type: 'separator',
  },
  {
    type: 'label',
    name: 'Security & Compliance',
  },
  {
    name: "Audit Logs",
    href: "/security/audit-logs",
    icon: Shield,
    type: "item",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings2,
    type: "item",
  },
];

export default function Layout(props: { children: React.ReactNode }) {
  const params = useParams<{ teamId: string }>();
  const user = useUser({ or: 'redirect' });
  const team = user.useTeam(params.teamId);
  const router = useRouter();

  if (!team) {
    router.push('/dashboard');
    return null;
  }

  return (
    <SidebarLayout 
      items={navigationItems}
      basePath={`/dashboard/${team.id}`}
      sidebarTop={<SelectedTeamSwitcher 
        selectedTeam={team}
        urlMap={(team) => `/dashboard/${team.id}`}
      />}
      baseBreadcrumb={[{
        title: team.displayName,
        href: `/dashboard/${team.id}`,
      }]}
    >
      {props.children}
    </SidebarLayout>
  );
}