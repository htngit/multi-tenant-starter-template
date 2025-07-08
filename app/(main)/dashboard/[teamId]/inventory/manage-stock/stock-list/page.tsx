import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Warehouse,
  ShoppingCart,
  Eye,
  Edit,
  Archive,
  RefreshCw,
  Calendar,
  DollarSign,
  Box
} from "lucide-react";

export const metadata: Metadata = {
  title: "Stock List | XalesIn ERP",
  description: "Comprehensive inventory stock management and tracking",
};

/**
 * Stock List Management Page Component
 * 
 * Features:
 * - Real-time inventory tracking
 * - Stock level monitoring and alerts
 * - Multi-warehouse stock management
 * - Stock movement history and analytics
 * 
 * @returns JSX.Element - Stock list management interface
 */
export default function StockListPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock List</h2>
          <p className="text-muted-foreground">
            Comprehensive inventory stock management and tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Stock
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Critical stock shortage
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
                placeholder="Search products by name, SKU, or category..."
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

      {/* Stock Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Inventory</CardTitle>
          <CardDescription>
            Real-time inventory levels across all warehouses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "PRD-001",
                name: "Wireless Bluetooth Headphones",
                sku: "WBH-2024-001",
                category: "Electronics",
                warehouse: "Main Warehouse",
                currentStock: 245,
                minStock: 50,
                maxStock: 500,
                unitPrice: 89.99,
                totalValue: 22047.55,
                lastUpdated: "2 hours ago",
                status: "In Stock"
              },
              {
                id: "PRD-002",
                name: "Ergonomic Office Chair",
                sku: "EOC-2024-002",
                category: "Furniture",
                warehouse: "Warehouse B",
                currentStock: 12,
                minStock: 15,
                maxStock: 100,
                unitPrice: 299.99,
                totalValue: 3599.88,
                lastUpdated: "1 hour ago",
                status: "Low Stock"
              },
              {
                id: "PRD-003",
                name: "Stainless Steel Water Bottle",
                sku: "SSWB-2024-003",
                category: "Accessories",
                warehouse: "Main Warehouse",
                currentStock: 0,
                minStock: 25,
                maxStock: 200,
                unitPrice: 24.99,
                totalValue: 0,
                lastUpdated: "30 minutes ago",
                status: "Out of Stock"
              },
              {
                id: "PRD-004",
                name: "Laptop Stand Adjustable",
                sku: "LSA-2024-004",
                category: "Electronics",
                warehouse: "Warehouse C",
                currentStock: 78,
                minStock: 20,
                maxStock: 150,
                unitPrice: 45.99,
                totalValue: 3587.22,
                lastUpdated: "45 minutes ago",
                status: "In Stock"
              },
              {
                id: "PRD-005",
                name: "Organic Cotton T-Shirt",
                sku: "OCT-2024-005",
                category: "Clothing",
                warehouse: "Main Warehouse",
                currentStock: 156,
                minStock: 30,
                maxStock: 300,
                unitPrice: 19.99,
                totalValue: 3118.44,
                lastUpdated: "15 minutes ago",
                status: "In Stock"
              },
              {
                id: "PRD-006",
                name: "Smart Fitness Tracker",
                sku: "SFT-2024-006",
                category: "Electronics",
                warehouse: "Warehouse B",
                currentStock: 8,
                minStock: 10,
                maxStock: 80,
                unitPrice: 129.99,
                totalValue: 1039.92,
                lastUpdated: "3 hours ago",
                status: "Low Stock"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Box className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{item.name}</p>
                      <Badge 
                        variant={
                          item.status === "In Stock" ? "default" : 
                          item.status === "Low Stock" ? "secondary" : "destructive"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.sku} • {item.category}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Warehouse className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.warehouse}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Updated {item.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Stock Level Indicator */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{item.currentStock}</p>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-1 rounded-full ${
                          item.currentStock === 0 ? 'bg-red-600' :
                          item.currentStock <= item.minStock ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ 
                          width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Stock Range */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{item.minStock} - {item.maxStock}</p>
                    <p className="text-xs text-muted-foreground">Min - Max</p>
                  </div>
                  
                  {/* Value */}
                  <div className="text-center">
                    <p className="text-sm font-medium">${item.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">${item.unitPrice}/unit</p>
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
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
            <CardDescription>Current inventory status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "In Stock", count: 2456, percentage: 86, color: "bg-green-600" },
                { status: "Low Stock", count: 234, percentage: 8, color: "bg-yellow-600" },
                { status: "Out of Stock", count: 157, percentage: 6, color: "bg-red-600" }
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
            <CardTitle>Top Categories by Value</CardTitle>
            <CardDescription>Highest value inventory categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Electronics", value: "$456,780", items: 234, percentage: 38 },
                { category: "Furniture", value: "$298,450", items: 156, percentage: 25 },
                { category: "Clothing", value: "$187,230", items: 445, percentage: 16 },
                { category: "Accessories", value: "$134,560", items: 678, percentage: 11 },
                { category: "Others", value: "$123,980", items: 334, percentage: 10 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.category}</p>
                      <p className="text-xs text-muted-foreground">{item.items} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Distribution and Stock Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Distribution</CardTitle>
            <CardDescription>Stock distribution across warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { warehouse: "Main Warehouse", items: 1245, value: "$567,890", utilization: 78 },
                { warehouse: "Warehouse B", items: 856, value: "$398,450", utilization: 65 },
                { warehouse: "Warehouse C", items: 746, value: "$234,560", utilization: 52 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Warehouse className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.warehouse}</p>
                      <p className="text-xs text-muted-foreground">{item.items} items • {item.utilization}% utilized</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.value}</p>
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-1 bg-blue-600 rounded-full"
                        style={{ width: `${item.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>Critical inventory notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Out of Stock</p>
                  <p className="text-xs text-muted-foreground">23 items need immediate restocking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Low Stock Warning</p>
                  <p className="text-xs text-muted-foreground">47 items below minimum threshold</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">High Demand</p>
                  <p className="text-xs text-muted-foreground">12 items showing increased demand</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Archive className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Slow Moving</p>
                  <p className="text-xs text-muted-foreground">8 items with low turnover rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement Trends</CardTitle>
          <CardDescription>Recent inventory movement patterns and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">+1,234</p>
              <p className="text-sm text-muted-foreground">Items Added (7 days)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">-987</p>
              <p className="text-sm text-muted-foreground">Items Sold (7 days)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Stock Adjustments</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.2x</p>
              <p className="text-sm text-muted-foreground">Avg. Turnover Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}