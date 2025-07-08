import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  Filter,
  BarChart3,
  Warehouse,
  User,
  Calendar,
  FileText,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  TrendingUp,
  TrendingDown,
  Target,
  Activity
} from "lucide-react";

export const metadata: Metadata = {
  title: "Stock Opname | XalesIn ERP",
  description: "Physical inventory counting and stock reconciliation management",
};

/**
 * Stock Opname (Physical Inventory) Management Page Component
 * 
 * Features:
 * - Physical inventory counting management
 * - Stock reconciliation and variance analysis
 * - Cycle counting and audit trails
 * - Multi-warehouse opname coordination
 * 
 * @returns JSX.Element - Stock opname management interface
 */
export default function StockOpnamePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Opname</h2>
          <p className="text-muted-foreground">
            Physical inventory counting and stock reconciliation management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Opname
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opnames</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 completed today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Counted</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              +234 since yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variances Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Requires investigation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.3%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last cycle
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
                placeholder="Search opname by ID, warehouse, or status..."
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

      {/* Active Stock Opnames */}
      <Card>
        <CardHeader>
          <CardTitle>Active Stock Opnames</CardTitle>
          <CardDescription>
            Current physical inventory counting sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "OP-2024-001",
                warehouse: "Main Warehouse",
                type: "Full Count",
                startDate: "2024-01-15",
                expectedEnd: "2024-01-17",
                progress: 75,
                itemsCounted: 1847,
                totalItems: 2456,
                variances: 12,
                assignedTo: "John Smith",
                status: "In Progress"
              },
              {
                id: "OP-2024-002",
                warehouse: "Warehouse B",
                type: "Cycle Count",
                startDate: "2024-01-16",
                expectedEnd: "2024-01-16",
                progress: 45,
                itemsCounted: 234,
                totalItems: 520,
                variances: 3,
                assignedTo: "Sarah Wilson",
                status: "In Progress"
              },
              {
                id: "OP-2024-003",
                warehouse: "Warehouse C",
                type: "Spot Check",
                startDate: "2024-01-16",
                expectedEnd: "2024-01-16",
                progress: 100,
                itemsCounted: 156,
                totalItems: 156,
                variances: 2,
                assignedTo: "Mike Johnson",
                status: "Completed"
              },
              {
                id: "OP-2024-004",
                warehouse: "Main Warehouse",
                type: "Category Count",
                startDate: "2024-01-17",
                expectedEnd: "2024-01-18",
                progress: 20,
                itemsCounted: 89,
                totalItems: 445,
                variances: 1,
                assignedTo: "Lisa Chen",
                status: "In Progress"
              }
            ].map((opname, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{opname.id}</p>
                      <Badge 
                        variant={
                          opname.status === "Completed" ? "default" : 
                          opname.status === "In Progress" ? "secondary" : "outline"
                        }
                      >
                        {opname.status}
                      </Badge>
                      <Badge variant="outline">{opname.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{opname.warehouse}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{opname.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{opname.startDate} - {opname.expectedEnd}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Progress */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{opname.progress}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${opname.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Items Counted */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{opname.itemsCounted}/{opname.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Items Counted</p>
                  </div>
                  
                  {/* Variances */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-yellow-600">{opname.variances}</p>
                    <p className="text-xs text-muted-foreground">Variances</p>
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

      {/* Variance Analysis and Opname Types */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Variance Analysis</CardTitle>
            <CardDescription>Stock discrepancies and their impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  item: "Wireless Headphones",
                  sku: "WBH-2024-001",
                  expected: 245,
                  actual: 238,
                  variance: -7,
                  value: -629.93,
                  type: "Shortage"
                },
                {
                  item: "Office Chair",
                  sku: "EOC-2024-002",
                  expected: 12,
                  actual: 15,
                  variance: +3,
                  value: +899.97,
                  type: "Overage"
                },
                {
                  item: "Water Bottle",
                  sku: "SSWB-2024-003",
                  expected: 0,
                  actual: 2,
                  variance: +2,
                  value: +49.98,
                  type: "Found"
                },
                {
                  item: "Laptop Stand",
                  sku: "LSA-2024-004",
                  expected: 78,
                  actual: 75,
                  variance: -3,
                  value: -137.97,
                  type: "Shortage"
                }
              ].map((variance, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      variance.type === "Shortage" ? "bg-red-100" :
                      variance.type === "Overage" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      {variance.type === "Shortage" ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : variance.type === "Overage" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <Package className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{variance.item}</p>
                      <p className="text-xs text-muted-foreground">{variance.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      variance.variance > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {variance.variance > 0 ? "+" : ""}{variance.variance}
                    </p>
                    <p className={`text-xs ${
                      variance.value > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      ${variance.value > 0 ? "+" : ""}${Math.abs(variance.value).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opname Types Distribution</CardTitle>
            <CardDescription>Count types and their frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Full Count", count: 4, percentage: 33, color: "bg-blue-600", description: "Complete warehouse inventory" },
                { type: "Cycle Count", count: 5, percentage: 42, color: "bg-green-600", description: "Regular periodic counts" },
                { type: "Spot Check", count: 2, percentage: 17, color: "bg-yellow-600", description: "Random verification" },
                { type: "Category Count", count: 1, percentage: 8, color: "bg-purple-600", description: "Specific category focus" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <ClipboardCheck className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.count}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-12 h-1 bg-gray-200 rounded-full">
                        <div 
                          className={`h-1 ${item.color} rounded-full`} 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Completed Opnames and Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
            <CardDescription>Latest finished stock opnames</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: "OP-2023-098",
                  warehouse: "Main Warehouse",
                  completedDate: "2024-01-14",
                  itemsCounted: 2456,
                  variances: 8,
                  accuracy: 99.7,
                  duration: "2 days"
                },
                {
                  id: "OP-2023-097",
                  warehouse: "Warehouse B",
                  completedDate: "2024-01-12",
                  itemsCounted: 856,
                  variances: 3,
                  accuracy: 99.6,
                  duration: "1 day"
                },
                {
                  id: "OP-2023-096",
                  warehouse: "Warehouse C",
                  completedDate: "2024-01-10",
                  itemsCounted: 746,
                  variances: 5,
                  accuracy: 99.3,
                  duration: "1 day"
                }
              ].map((opname, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{opname.id}</p>
                      <p className="text-xs text-muted-foreground">{opname.warehouse} • {opname.completedDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{opname.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">{opname.variances} variances</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Opname efficiency and accuracy trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Average Accuracy</span>
                </div>
                <span className="text-lg font-bold">98.7%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Avg. Completion Time</span>
                </div>
                <span className="text-lg font-bold">1.8 days</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Items per Hour</span>
                </div>
                <span className="text-lg font-bold">127</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Variance Rate</span>
                </div>
                <span className="text-lg font-bold">1.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Opname Schedule */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common opname operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Start New Opname
              </Button>
              <Button variant="outline" className="justify-start">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Resume Counting
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Variances
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Planned opname activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Monthly Full Count</p>
                  <p className="text-xs text-muted-foreground">Main Warehouse - Jan 30, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Weekly Cycle Count</p>
                  <p className="text-xs text-muted-foreground">Warehouse B - Jan 22, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">High-Value Items</p>
                  <p className="text-xs text-muted-foreground">All Warehouses - Jan 25, 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}