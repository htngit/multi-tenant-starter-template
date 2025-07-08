import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Truck, 
  Clock, 
  CheckCircle, 
  Package,
  MapPin,
  AlertTriangle,
  User,
  Calendar,
  Building2,
  FileText,
  Scan
} from "lucide-react";

export const metadata: Metadata = {
  title: "Purchase Delivery | XalesIn ERP",
  description: "Track and manage purchase deliveries and shipments",
};

/**
 * Purchase Delivery Management Page Component
 * 
 * Features:
 * - Track delivery status and shipments
 * - Manage receiving and quality control
 * - Monitor delivery performance and logistics
 * - Integration with inventory and warehouse systems
 * 
 * @returns JSX.Element - Purchase delivery management interface
 */
export default function PurchaseDeliveryPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Delivery</h2>
          <p className="text-muted-foreground">
            Track and manage purchase deliveries and shipments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Scan className="mr-2 h-4 w-4" />
            Receive Delivery
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Expected this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Successfully received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Receipt</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
          <CardDescription>
            Current shipments and their delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">DEL-{String(item).padStart(6, '0')}</p>
                    <p className="text-sm text-muted-foreground">PO-{String(item + 100).padStart(6, '0')}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">ABC Manufacturing</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Warehouse {item}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">ETA: {item + 1} days</span>
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
                     item % 2 === 0 ? "Shipped" : "Delayed"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">{15 + item} items</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status Overview</CardTitle>
            <CardDescription>Current status of all deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Delivered", count: 89, percentage: 57, color: "bg-green-600" },
                { status: "In Transit", count: 23, percentage: 15, color: "bg-blue-600" },
                { status: "Shipped", count: 28, percentage: 18, color: "bg-yellow-600" },
                { status: "Delayed", count: 16, percentage: 10, color: "bg-red-600" }
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
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Key delivery metrics and KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">On-Time Delivery</span>
                </div>
                <span className="text-lg font-bold text-green-600">94.2%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Avg. Delivery Time</span>
                </div>
                <span className="text-lg font-bold">3.2 days</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Damage Rate</span>
                </div>
                <span className="text-lg font-bold text-red-600">0.8%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Active Carriers</span>
                </div>
                <span className="text-lg font-bold">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Receipts and Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
            <CardDescription>Latest received deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "DEL-000123", supplier: "ABC Manufacturing", items: 24, time: "2 hours ago" },
                { id: "DEL-000124", supplier: "XYZ Supplies", items: 18, time: "4 hours ago" },
                { id: "DEL-000125", supplier: "Global Parts", items: 32, time: "6 hours ago" },
                { id: "DEL-000126", supplier: "Tech Components", items: 15, time: "8 hours ago" },
                { id: "DEL-000127", supplier: "Industrial Materials", items: 28, time: "1 day ago" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.id}</p>
                      <p className="text-xs text-muted-foreground">{item.supplier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.items} items</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Alerts</CardTitle>
            <CardDescription>Important notifications and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Delayed Shipments</p>
                  <p className="text-xs text-muted-foreground">3 deliveries are behind schedule</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Pending Receipts</p>
                  <p className="text-xs text-muted-foreground">15 deliveries awaiting processing</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">In Transit</p>
                  <p className="text-xs text-muted-foreground">23 shipments on the way</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Quality Check</p>
                  <p className="text-xs text-muted-foreground">8 deliveries passed inspection</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common delivery management operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Scan className="mr-2 h-4 w-4" />
              Receive Delivery
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Generate Receipt
            </Button>
            <Button variant="outline" className="justify-start">
              <MapPin className="mr-2 h-4 w-4" />
              Track Shipment
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carrier Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance</CardTitle>
          <CardDescription>Delivery performance by shipping carriers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { carrier: "Express Logistics", onTime: 96, deliveries: 45, rating: 4.8 },
              { carrier: "Fast Freight Co.", onTime: 94, deliveries: 38, rating: 4.6 },
              { carrier: "Global Shipping", onTime: 92, deliveries: 52, rating: 4.5 },
              { carrier: "Quick Transport", onTime: 89, deliveries: 28, rating: 4.2 },
              { carrier: "Reliable Delivery", onTime: 87, deliveries: 33, rating: 4.0 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.carrier}</p>
                    <p className="text-xs text-muted-foreground">{item.deliveries} deliveries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.onTime}% on-time</p>
                  <p className="text-xs text-muted-foreground">★ {item.rating}/5.0</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}