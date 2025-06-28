import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Trash2, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Warehouse,
  User,
  Calendar,
  FileText,
  Eye,
  Edit,
  Archive,
  RefreshCw,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  PieChart,
  Target
} from "lucide-react";

export const metadata: Metadata = {
  title: "Waste Stock | XalesIn ERP",
  description: "Waste inventory management and disposal tracking",
};

/**
 * Waste Stock Management Page Component
 * 
 * Features:
 * - Track damaged, expired, and obsolete inventory
 * - Waste disposal management and documentation
 * - Cost analysis and loss prevention
 * - Compliance and audit trail for waste disposal
 * 
 * @returns JSX.Element - Waste stock management interface
 */
export default function WasteStockPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Waste Stock</h2>
          <p className="text-muted-foreground">
            Waste inventory management and disposal tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Waste
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste Value</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$23,450</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Items</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">347</div>
            <p className="text-xs text-muted-foreground">
              +23 items this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Disposal</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              Awaiting disposal approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">
              Of total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search waste records by item, reason, or reference..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Waste Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Waste Records</CardTitle>
          <CardDescription>
            Latest waste inventory entries and disposal activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "WST-2024-001",
                item: "Wireless Bluetooth Headphones",
                sku: "WBH-2024-001",
                quantity: 12,
                unitValue: 89.99,
                totalValue: 1079.88,
                reason: "Damaged in Transit",
                warehouse: "Main Warehouse",
                reportedBy: "John Smith",
                reportedDate: "2024-01-16",
                status: "Pending Disposal",
                category: "Damaged"
              },
              {
                id: "WST-2024-002",
                item: "Organic Cotton T-Shirt",
                sku: "OCT-2024-005",
                quantity: 25,
                unitValue: 19.99,
                totalValue: 499.75,
                reason: "Quality Defect",
                warehouse: "Warehouse B",
                reportedBy: "Sarah Wilson",
                reportedDate: "2024-01-15",
                status: "Disposed",
                category: "Defective"
              },
              {
                id: "WST-2024-003",
                item: "Stainless Steel Water Bottle",
                sku: "SSWB-2024-003",
                quantity: 8,
                unitValue: 24.99,
                totalValue: 199.92,
                reason: "Expired Product",
                warehouse: "Warehouse C",
                reportedBy: "Mike Johnson",
                reportedDate: "2024-01-14",
                status: "Approved for Disposal",
                category: "Expired"
              },
              {
                id: "WST-2024-004",
                item: "Laptop Stand Adjustable",
                sku: "LSA-2024-004",
                quantity: 3,
                unitValue: 45.99,
                totalValue: 137.97,
                reason: "Customer Return - Damaged",
                warehouse: "Main Warehouse",
                reportedBy: "Lisa Chen",
                reportedDate: "2024-01-13",
                status: "Under Review",
                category: "Return"
              },
              {
                id: "WST-2024-005",
                item: "Smart Fitness Tracker",
                sku: "SFT-2024-006",
                quantity: 5,
                unitValue: 129.99,
                totalValue: 649.95,
                reason: "Obsolete Model",
                warehouse: "Warehouse B",
                reportedBy: "David Brown",
                reportedDate: "2024-01-12",
                status: "Disposed",
                category: "Obsolete"
              }
            ].map((waste, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{waste.item}</p>
                      <Badge 
                        variant={
                          waste.status === "Disposed" ? "default" : 
                          waste.status === "Pending Disposal" ? "secondary" : 
                          waste.status === "Approved for Disposal" ? "outline" : "destructive"
                        }
                      >
                        {waste.status}
                      </Badge>
                      <Badge variant="outline">{waste.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{waste.sku} • {waste.reason}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Warehouse className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{waste.warehouse}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{waste.reportedBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{waste.reportedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Quantity */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{waste.quantity}</p>
                    <p className="text-xs text-muted-foreground">Qty</p>
                  </div>
                  
                  {/* Unit Value */}
                  <div className="text-center">
                    <p className="text-sm font-medium">${waste.unitValue}</p>
                    <p className="text-xs text-muted-foreground">Unit</p>
                  </div>
                  
                  {/* Total Value */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-red-600">${waste.totalValue}</p>
                    <p className="text-xs text-muted-foreground">Total Loss</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waste Categories and Disposal Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waste Categories</CardTitle>
            <CardDescription>Breakdown by waste type and reason</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Damaged", count: 156, value: 12450, percentage: 45, color: "bg-red-600" },
                { category: "Expired", count: 89, value: 6780, percentage: 26, color: "bg-orange-600" },
                { category: "Defective", count: 67, value: 3240, percentage: 19, color: "bg-yellow-600" },
                { category: "Obsolete", count: 23, value: 890, percentage: 7, color: "bg-gray-600" },
                { category: "Return", count: 12, value: 90, percentage: 3, color: "bg-blue-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{item.category}</span>
                      <p className="text-xs text-muted-foreground">{item.count} items • ${item.value.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 ${item.color} rounded-full`} 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disposal Status</CardTitle>
            <CardDescription>Current status of waste disposal process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Pending Disposal", count: 89, value: 8450, color: "bg-yellow-600" },
                { status: "Approved for Disposal", count: 45, value: 4230, color: "bg-blue-600" },
                { status: "Under Review", count: 67, value: 6780, color: "bg-orange-600" },
                { status: "Disposed", count: 146, value: 3990, color: "bg-green-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === "Disposed" ? "bg-green-100" :
                      item.status === "Approved for Disposal" ? "bg-blue-100" :
                      item.status === "Pending Disposal" ? "bg-yellow-100" : "bg-orange-100"
                    }`}>
                      {item.status === "Disposed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : item.status === "Approved for Disposal" ? (
                        <Clock className="h-4 w-4 text-blue-600" />
                      ) : item.status === "Pending Disposal" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.status}</p>
                      <p className="text-xs text-muted-foreground">{item.count} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${item.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste Trends and Top Waste Items */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Waste Trends</CardTitle>
            <CardDescription>Waste value and quantity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: "January 2024", value: 23450, items: 347, trend: "+15%" },
                { month: "December 2023", value: 20390, items: 298, trend: "+8%" },
                { month: "November 2023", value: 18870, items: 276, trend: "-5%" },
                { month: "October 2023", value: 19890, items: 312, trend: "+12%" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.month}</p>
                      <p className="text-xs text-muted-foreground">{item.items} items wasted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${item.value.toLocaleString()}</p>
                    <p className={`text-xs ${
                      item.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Waste Items</CardTitle>
            <CardDescription>Items with highest waste frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  item: "Wireless Headphones",
                  sku: "WBH-2024-001",
                  wasteCount: 45,
                  totalValue: 4049.55,
                  mainReason: "Damaged in Transit"
                },
                {
                  item: "Organic Cotton T-Shirt",
                  sku: "OCT-2024-005",
                  wasteCount: 38,
                  totalValue: 759.62,
                  mainReason: "Quality Defect"
                },
                {
                  item: "Smart Fitness Tracker",
                  sku: "SFT-2024-006",
                  wasteCount: 23,
                  totalValue: 2989.77,
                  mainReason: "Obsolete Model"
                },
                {
                  item: "Laptop Stand",
                  sku: "LSA-2024-004",
                  wasteCount: 19,
                  totalValue: 873.81,
                  mainReason: "Customer Return"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.item}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} • {item.mainReason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.wasteCount}x</p>
                    <p className="text-xs text-red-600">${item.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waste Performance Metrics</CardTitle>
            <CardDescription>Key indicators for waste management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Waste Rate</span>
                </div>
                <span className="text-lg font-bold">2.3%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Avg. Monthly Loss</span>
                </div>
                <span className="text-lg font-bold">$21,900</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Disposal Efficiency</span>
                </div>
                <span className="text-lg font-bold">87%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Avg. Processing Time</span>
                </div>
                <span className="text-lg font-bold">3.2 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common waste management operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Record New Waste
              </Button>
              <Button variant="outline" className="justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Disposal
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="justify-start">
                <Archive className="mr-2 h-4 w-4" />
                Archive Records
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance and Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Audit Trail</CardTitle>
          <CardDescription>Waste disposal compliance and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm text-muted-foreground">Documentation Complete</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Compliance Records</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Audit Trail Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}