import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  FileInput, 
  Clock, 
  CheckCircle, 
  Truck,
  DollarSign,
  AlertTriangle,
  User,
  Calendar,
  Building2,
  Package
} from "lucide-react";

export const metadata: Metadata = {
  title: "Purchase Orders | XalesIn ERP",
  description: "Manage purchase orders and supplier transactions",
};

/**
 * Purchase Order Management Page Component
 * 
 * Features:
 * - Create and manage purchase orders
 * - Track PO status and delivery timeline
 * - Monitor supplier performance and costs
 * - Integration with inventory and financial systems
 * 
 * @returns JSX.Element - Purchase order management interface
 */
export default function PurchaseOrderPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POs</CardTitle>
            <FileInput className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Expected this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
          <CardDescription>
            Track and manage your purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample PO entries */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-medium">PO-2024-001</span>
                  <span className="text-sm text-muted-foreground">Office Supplies Ltd.</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
                <span className="font-medium">$1,250.00</span>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-medium">PO-2024-002</span>
                  <span className="text-sm text-muted-foreground">Tech Solutions Inc.</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Approved
                </Badge>
                <span className="font-medium">$5,800.00</span>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-medium">PO-2024-003</span>
                  <span className="text-sm text-muted-foreground">Industrial Parts Co.</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">
                  <Truck className="mr-1 h-3 w-3" />
                  In Transit
                </Badge>
                <span className="font-medium">$3,200.00</span>
                <Button variant="ghost" size="sm">
                  Track Shipment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}