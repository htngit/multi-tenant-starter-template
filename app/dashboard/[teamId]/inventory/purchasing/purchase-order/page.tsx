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
            Create PO
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
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Awaiting supplier confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">
              On the way to warehouse
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$284,592</div>
            <p className="text-xs text-muted-foreground">
              This month's PO value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
          <CardDescription>
            Latest purchase orders and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileInput className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">PO-{String(item).padStart(6, '0')}</p>
                    <p className="text-sm text-muted-foreground">ABC Manufacturing Co.</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sarah Wilson</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item} days ago</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{15 + item} items</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      item % 4 === 0 ? "default" : 
                      item % 3 === 0 ? "secondary" : 
                      item % 2 === 0 ? "outline" : "destructive"
                    }
                  >
                    {item % 4 === 0 ? "Delivered" : 
                     item % 3 === 0 ? "In Transit" : 
                     item % 2 === 0 ? "Confirmed" : "Pending"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">${(1234 * item).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics and Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>PO Status Distribution</CardTitle>
            <CardDescription>Current status of all purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Delivered", count: 156, percentage: 45, color: "bg-green-600" },
                { status: "In Transit", count: 78, percentage: 23, color: "bg-blue-600" },
                { status: "Confirmed", count: 63, percentage: 18, color: "bg-yellow-600" },
                { status: "Pending", count: 45, percentage: 14, color: "bg-gray-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.status}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 ${item.color} rounded-full`} 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers</CardTitle>
            <CardDescription>Suppliers by purchase volume this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { supplier: "ABC Manufacturing Co.", amount: "$45,230", orders: 12 },
                { supplier: "XYZ Supplies Ltd.", amount: "$38,450", orders: 8 },
                { supplier: "Global Parts Inc.", amount: "$32,180", orders: 15 },
                { supplier: "Tech Components Co.", amount: "$28,920", orders: 6 },
                { supplier: "Industrial Materials", amount: "$24,670", orders: 9 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.supplier}</p>
                      <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                    </div>
                  </div>
                  <span className="font-medium">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common purchase order operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
              <Button variant="outline" className="justify-start">
                <FileInput className="mr-2 h-4 w-4" />
                Import PO Template
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export PO Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Suppliers
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Important updates and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Overdue Deliveries</p>
                  <p className="text-xs text-muted-foreground">5 POs are past due date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Pending Approvals</p>
                  <p className="text-xs text-muted-foreground">8 POs awaiting approval</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Recent Deliveries</p>
                  <p className="text-xs text-muted-foreground">12 POs delivered today</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Performance</CardTitle>
          <CardDescription>Key performance indicators and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">5.2</p>
              <p className="text-sm text-muted-foreground">Avg. Lead Time (Days)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">$2,340</p>
              <p className="text-sm text-muted-foreground">Avg. PO Value</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">28</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}