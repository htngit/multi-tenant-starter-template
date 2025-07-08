import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Package
} from "lucide-react";

export const metadata: Metadata = {
  title: "Product Request | XalesIn ERP",
  description: "Manage product requests and procurement workflows",
};

/**
 * Product Request Management Page Component
 * 
 * Features:
 * - Create and manage product requests
 * - Track request status and approval workflow
 * - Monitor request analytics and performance
 * - Integration with procurement and purchasing processes
 * 
 * @returns JSX.Element - Product request management interface
 */
export default function ProductRequestPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Request</h2>
          <p className="text-muted-foreground">
            Manage product requests and procurement workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              Awaiting manager approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">
              Ready for procurement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">
              Requires revision
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Product Requests</CardTitle>
          <CardDescription>
            Latest product requests submitted by departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">REQ-{String(item).padStart(4, '0')}</p>
                    <p className="text-sm text-muted-foreground">Office Supplies Request</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">John Doe</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">2 days ago</span>
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
                    {item % 4 === 0 ? "Approved" : 
                     item % 3 === 0 ? "Pending" : 
                     item % 2 === 0 ? "Under Review" : "Rejected"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">5 items</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Categories</CardTitle>
            <CardDescription>Breakdown by request type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Office Supplies", count: 85, percentage: 34 },
                { category: "IT Equipment", count: 62, percentage: 25 },
                { category: "Raw Materials", count: 48, percentage: 19 },
                { category: "Maintenance", count: 35, percentage: 14 },
                { category: "Others", count: 18, percentage: 8 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.category}</span>
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
            <CardTitle>Approval Workflow</CardTitle>
            <CardDescription>Current approval status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">Pending Manager Review</p>
                    <p className="text-xs text-muted-foreground">15 requests waiting</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Pending Budget Approval</p>
                    <p className="text-xs text-muted-foreground">8 requests waiting</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Ready for Procurement</p>
                    <p className="text-xs text-muted-foreground">23 approved requests</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Process
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Request Performance</CardTitle>
          <CardDescription>Key metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">3.2</p>
              <p className="text-sm text-muted-foreground">Avg. Days to Approve</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">89%</p>
              <p className="text-sm text-muted-foreground">Approval Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Avg. Items per Request</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-muted-foreground">Active Requesters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}