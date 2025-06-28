import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Factory, 
  Play, 
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Package,
  User,
  Calendar,
  FileText,
  Eye,
  Edit,
  Settings,
  RefreshCw,
  Target,
  Activity,
  Zap,
  Users,
  Timer,
  Wrench,
  Clipboard,
  PieChart,
  TrendingDown,
  ArrowRight,
  MapPin,
  Layers
} from "lucide-react";

export const metadata: Metadata = {
  title: "Production List | XalesIn ERP",
  description: "Production order management and manufacturing tracking",
};

/**
 * Production List Management Page Component
 * 
 * Features:
 * - Track production orders and manufacturing processes
 * - Monitor production status and progress
 * - Resource allocation and capacity planning
 * - Quality control and production analytics
 * 
 * @returns JSX.Element - Production list management interface
 */
export default function ProductionListPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production List</h2>
          <p className="text-muted-foreground">
            Production order management and manufacturing tracking
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
            New Production Order
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Productions</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +3 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Target: 12 orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              Of total capacity
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
                placeholder="Search production orders by ID, product, or status..."
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

      {/* Active Production Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Production Orders</CardTitle>
          <CardDescription>
            Current manufacturing orders and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "PO-2024-001",
                product: "Wireless Bluetooth Headphones",
                sku: "WBH-2024-001",
                quantity: 500,
                produced: 320,
                startDate: "2024-01-15",
                dueDate: "2024-01-22",
                status: "In Progress",
                priority: "High",
                workstation: "Assembly Line A",
                supervisor: "John Smith",
                progress: 64,
                estimatedCompletion: "2024-01-20"
              },
              {
                id: "PO-2024-002",
                product: "Organic Cotton T-Shirt",
                sku: "OCT-2024-005",
                quantity: 1000,
                produced: 850,
                startDate: "2024-01-12",
                dueDate: "2024-01-18",
                status: "Quality Check",
                priority: "Medium",
                workstation: "Textile Line B",
                supervisor: "Sarah Wilson",
                progress: 85,
                estimatedCompletion: "2024-01-17"
              },
              {
                id: "PO-2024-003",
                product: "Stainless Steel Water Bottle",
                sku: "SSWB-2024-003",
                quantity: 300,
                produced: 45,
                startDate: "2024-01-16",
                dueDate: "2024-01-25",
                status: "Material Shortage",
                priority: "Low",
                workstation: "Metal Works C",
                supervisor: "Mike Johnson",
                progress: 15,
                estimatedCompletion: "2024-01-28"
              },
              {
                id: "PO-2024-004",
                product: "Laptop Stand Adjustable",
                sku: "LSA-2024-004",
                quantity: 200,
                produced: 180,
                startDate: "2024-01-10",
                dueDate: "2024-01-17",
                status: "Final Assembly",
                priority: "High",
                workstation: "Assembly Line D",
                supervisor: "Lisa Chen",
                progress: 90,
                estimatedCompletion: "2024-01-17"
              },
              {
                id: "PO-2024-005",
                product: "Smart Fitness Tracker",
                sku: "SFT-2024-006",
                quantity: 750,
                produced: 0,
                startDate: "2024-01-17",
                dueDate: "2024-01-30",
                status: "Scheduled",
                priority: "Medium",
                workstation: "Electronics Line E",
                supervisor: "David Brown",
                progress: 0,
                estimatedCompletion: "2024-01-30"
              }
            ].map((order, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Factory className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{order.product}</p>
                      <Badge 
                        variant={
                          order.status === "In Progress" ? "default" : 
                          order.status === "Quality Check" ? "secondary" : 
                          order.status === "Final Assembly" ? "outline" : 
                          order.status === "Scheduled" ? "secondary" : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                      <Badge 
                        variant={
                          order.priority === "High" ? "destructive" : 
                          order.priority === "Medium" ? "default" : "secondary"
                        }
                      >
                        {order.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.id} • {order.sku}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{order.workstation}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{order.supervisor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due: {order.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Progress */}
                  <div className="text-center">
                    <div className="w-16 h-16 relative">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${order.progress}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium">{order.progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{order.produced}/{order.quantity}</p>
                    <p className="text-xs text-muted-foreground">Produced</p>
                  </div>
                  
                  {/* Estimated Completion */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{order.estimatedCompletion}</p>
                    <p className="text-xs text-muted-foreground">Est. Complete</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {order.status === "In Progress" ? (
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : order.status === "Scheduled" ? (
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Status and Workstation Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Production Status Overview</CardTitle>
            <CardDescription>Current status distribution of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "In Progress", count: 23, percentage: 45, color: "bg-blue-600" },
                { status: "Quality Check", count: 12, percentage: 24, color: "bg-yellow-600" },
                { status: "Final Assembly", count: 8, percentage: 16, color: "bg-purple-600" },
                { status: "Scheduled", count: 5, percentage: 10, color: "bg-gray-600" },
                { status: "Material Shortage", count: 3, percentage: 5, color: "bg-red-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Factory className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
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
            <CardTitle>Workstation Utilization</CardTitle>
            <CardDescription>Current capacity and workload by station</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { station: "Assembly Line A", utilization: 85, capacity: 100, activeOrders: 3, status: "High" },
                { station: "Textile Line B", utilization: 72, capacity: 100, activeOrders: 2, status: "Medium" },
                { station: "Metal Works C", utilization: 45, capacity: 100, activeOrders: 1, status: "Low" },
                { station: "Assembly Line D", utilization: 90, capacity: 100, activeOrders: 4, status: "High" },
                { station: "Electronics Line E", utilization: 60, capacity: 100, activeOrders: 2, status: "Medium" }
              ].map((station, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      station.status === "High" ? "bg-red-100" :
                      station.status === "Medium" ? "bg-yellow-100" : "bg-green-100"
                    }`}>
                      <Wrench className={`h-4 w-4 ${
                        station.status === "High" ? "text-red-600" :
                        station.status === "Medium" ? "text-yellow-600" : "text-green-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{station.station}</p>
                      <p className="text-xs text-muted-foreground">{station.activeOrders} active orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{station.utilization}%</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          station.utilization >= 80 ? "bg-red-600" :
                          station.utilization >= 60 ? "bg-yellow-600" : "bg-green-600"
                        }`}
                        style={{ width: `${station.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Performance and Resource Allocation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Production Performance</CardTitle>
            <CardDescription>Key performance indicators and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">On-Time Delivery</span>
                </div>
                <span className="text-lg font-bold">92%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Production Speed</span>
                </div>
                <span className="text-lg font-bold">87%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Quality Rate</span>
                </div>
                <span className="text-lg font-bold">95%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Overall Efficiency</span>
                </div>
                <span className="text-lg font-bold">89%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>Current resource distribution and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  resource: "Production Staff",
                  allocated: 45,
                  available: 60,
                  utilization: 75,
                  icon: Users
                },
                {
                  resource: "Machinery",
                  allocated: 18,
                  available: 25,
                  utilization: 72,
                  icon: Settings
                },
                {
                  resource: "Raw Materials",
                  allocated: 85,
                  available: 100,
                  utilization: 85,
                  icon: Package
                },
                {
                  resource: "Quality Inspectors",
                  allocated: 8,
                  available: 12,
                  utilization: 67,
                  icon: Clipboard
                }
              ].map((resource, index) => {
                const IconComponent = resource.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{resource.resource}</p>
                        <p className="text-xs text-muted-foreground">{resource.allocated}/{resource.available} allocated</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{resource.utilization}%</p>
                      <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${resource.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common production management operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Production Order
              </Button>
              <Button variant="outline" className="justify-start">
                <Play className="mr-2 h-4 w-4" />
                Start Production
              </Button>
              <Button variant="outline" className="justify-start">
                <CheckCircle className="mr-2 h-4 w-4" />
                Quality Inspection
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Workstation Setup
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  type: "warning",
                  title: "Material Shortage",
                  message: "PO-2024-003 delayed due to steel shortage",
                  time: "2 hours ago",
                  icon: AlertTriangle
                },
                {
                  type: "info",
                  title: "Quality Check Required",
                  message: "PO-2024-002 ready for final inspection",
                  time: "4 hours ago",
                  icon: CheckCircle
                },
                {
                  type: "success",
                  title: "Production Completed",
                  message: "PO-2024-001 batch completed successfully",
                  time: "6 hours ago",
                  icon: Factory
                },
                {
                  type: "warning",
                  title: "Capacity Alert",
                  message: "Assembly Line D at 90% capacity",
                  time: "8 hours ago",
                  icon: Activity
                }
              ].map((alert, index) => {
                const IconComponent = alert.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      alert.type === "warning" ? "bg-yellow-100" :
                      alert.type === "success" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        alert.type === "warning" ? "text-yellow-600" :
                        alert.type === "success" ? "text-green-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Schedule and Capacity Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Production Schedule & Capacity Planning</CardTitle>
          <CardDescription>Upcoming production schedule and capacity analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Hours Scheduled</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Layers className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">73%</p>
              <p className="text-sm text-muted-foreground">Capacity Utilization</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Orders This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}