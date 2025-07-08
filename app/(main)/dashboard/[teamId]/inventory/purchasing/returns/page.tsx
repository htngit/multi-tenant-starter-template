import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  RotateCcw, 
  Package, 
  Calendar, 
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Returns Management | XalesIn ERP",
  description: "Manage product returns and purchase returns efficiently",
};

/**
 * Returns Management Page Component
 * 
 * Features:
 * - Dual tab interface for Returns and Purchase Returns
 * - Comprehensive return tracking and management
 * - Real-time status updates and analytics
 * - Integrated workflow for return processing
 * 
 * @returns JSX.Element - Returns management interface
 */
export default function ReturnsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Returns Management</h2>
          <p className="text-muted-foreground">
            Manage product returns and purchase returns efficiently
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Return
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="returns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="returns" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Returns
          </TabsTrigger>
          <TabsTrigger value="purchase-returns" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Purchase Returns
          </TabsTrigger>
        </TabsList>

        {/* Returns Tab */}
        <TabsContent value="returns" className="space-y-6">
          {/* Returns Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed Returns</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">133</div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Return Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231</div>
                <p className="text-xs text-muted-foreground">
                  Total return value
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Returns */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Returns</CardTitle>
              <CardDescription>
                Latest customer return requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <RotateCcw className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Return #{String(item).padStart(6, '0')}</p>
                        <p className="text-sm text-muted-foreground">Customer: John Doe</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item % 3 === 0 ? "default" : item % 2 === 0 ? "secondary" : "outline"}>
                        {item % 3 === 0 ? "Processed" : item % 2 === 0 ? "Pending" : "Approved"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">$234.50</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Return Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Return Reasons</CardTitle>
                <CardDescription>Most common reasons for returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { reason: "Defective Product", count: 45, percentage: 35 },
                    { reason: "Wrong Item", count: 32, percentage: 25 },
                    { reason: "Size Issues", count: 28, percentage: 22 },
                    { reason: "Not as Described", count: 23, percentage: 18 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.reason}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
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
                <CardTitle>Return Trends</CardTitle>
                <CardDescription>Monthly return statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { month: "January", returns: 45, trend: "+5%" },
                    { month: "February", returns: 38, trend: "-15%" },
                    { month: "March", returns: 52, trend: "+37%" },
                    { month: "April", returns: 41, trend: "-21%" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.returns}</span>
                        <Badge variant={item.trend.startsWith('+') ? "destructive" : "default"}>
                          {item.trend}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Purchase Returns Tab */}
        <TabsContent value="purchase-returns" className="space-y-6">
          {/* Purchase Returns Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchase Returns</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting supplier approval
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Returns</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">77</div>
                <p className="text-xs text-muted-foreground">
                  Successfully processed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Return Credit</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$28,945</div>
                <p className="text-xs text-muted-foreground">
                  Total credit received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Purchase Returns */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Returns</CardTitle>
              <CardDescription>
                Latest purchase return requests to suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">PR#{String(item).padStart(6, '0')}</p>
                        <p className="text-sm text-muted-foreground">Supplier: ABC Corp</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item % 3 === 0 ? "default" : item % 2 === 0 ? "secondary" : "outline"}>
                        {item % 3 === 0 ? "Approved" : item % 2 === 0 ? "Pending" : "Submitted"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">$1,234.50</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Purchase Return Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Return Categories</CardTitle>
                <CardDescription>Purchase return breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: "Quality Issues", count: 35, percentage: 40 },
                    { category: "Damaged in Transit", count: 25, percentage: 28 },
                    { category: "Wrong Specification", count: 18, percentage: 20 },
                    { category: "Excess Inventory", count: 11, percentage: 12 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-600 rounded-full" 
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
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>Return rates by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { supplier: "ABC Corp", rate: "2.1%", status: "Good" },
                    { supplier: "XYZ Ltd", rate: "3.8%", status: "Average" },
                    { supplier: "DEF Inc", rate: "1.2%", status: "Excellent" },
                    { supplier: "GHI Co", rate: "5.4%", status: "Poor" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.supplier}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.rate}</span>
                        <Badge 
                          variant={
                            item.status === "Excellent" ? "default" :
                            item.status === "Good" ? "secondary" :
                            item.status === "Average" ? "outline" : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}