import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign,
  AlertTriangle,
  User,
  Calendar,
  Building2,
  Receipt,
  CreditCard,
  Eye
} from "lucide-react";

export const metadata: Metadata = {
  title: "Purchase Invoice | XalesIn ERP",
  description: "Manage purchase invoices and supplier billing",
};

/**
 * Purchase Invoice Management Page Component
 * 
 * Features:
 * - Create and manage purchase invoices
 * - Track invoice status and payment terms
 * - Monitor supplier billing and accounts payable
 * - Integration with financial and accounting systems
 * 
 * @returns JSX.Element - Purchase invoice management interface
 */
export default function PurchaseInvoicePage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Invoice</h2>
          <p className="text-muted-foreground">
            Manage purchase invoices and supplier billing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">284</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              $156,780 outstanding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <p className="text-xs text-muted-foreground">
              $324,560 processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              $23,450 past due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Invoices</CardTitle>
          <CardDescription>
            Latest invoices and their payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">INV-{String(item).padStart(6, '0')}</p>
                    <p className="text-sm text-muted-foreground">ABC Manufacturing Co.</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sarah Wilson</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due: {item + 7} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">PO-{String(item + 100).padStart(6, '0')}</span>
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
                    {item % 4 === 0 ? "Paid" : 
                     item % 3 === 0 ? "Pending" : 
                     item % 2 === 0 ? "Approved" : "Overdue"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">${(2340 * item).toLocaleString()}</p>
                  <Button variant="ghost" size="sm" className="mt-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
            <CardDescription>Current status of all purchase invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Paid", count: 187, percentage: 66, color: "bg-green-600" },
                { status: "Pending", count: 42, percentage: 15, color: "bg-yellow-600" },
                { status: "Approved", count: 47, percentage: 16, color: "bg-blue-600" },
                { status: "Overdue", count: 8, percentage: 3, color: "bg-red-600" }
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
            <CardTitle>Payment Terms Analysis</CardTitle>
            <CardDescription>Invoice distribution by payment terms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { term: "Net 30", count: 156, amount: "$234,560" },
                { term: "Net 15", count: 78, amount: "$145,230" },
                { term: "Net 60", count: 34, amount: "$89,450" },
                { term: "Due on Receipt", count: 16, amount: "$45,670" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.term}</p>
                      <p className="text-xs text-muted-foreground">{item.count} invoices</p>
                    </div>
                  </div>
                  <span className="font-medium">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers and Payment Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers by Invoice Value</CardTitle>
            <CardDescription>Suppliers with highest invoice amounts this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { supplier: "ABC Manufacturing Co.", amount: "$67,890", invoices: 18 },
                { supplier: "XYZ Supplies Ltd.", amount: "$54,230", invoices: 12 },
                { supplier: "Global Parts Inc.", amount: "$43,560", invoices: 22 },
                { supplier: "Tech Components Co.", amount: "$38,920", invoices: 9 },
                { supplier: "Industrial Materials", amount: "$32,450", invoices: 15 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.supplier}</p>
                      <p className="text-xs text-muted-foreground">{item.invoices} invoices</p>
                    </div>
                  </div>
                  <span className="font-medium">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Monthly payment overview and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Paid</span>
                </div>
                <span className="text-lg font-bold text-green-600">$324,560</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Outstanding</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">$156,780</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <span className="text-lg font-bold text-red-600">$23,450</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Avg. Payment Time</span>
                </div>
                <span className="text-lg font-bold">18 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common invoice management operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button variant="outline" className="justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Invoices
              </Button>
              <Button variant="outline" className="justify-start">
                <Receipt className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Alerts</CardTitle>
            <CardDescription>Important notifications and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Overdue Invoices</p>
                  <p className="text-xs text-muted-foreground">8 invoices past due date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Due This Week</p>
                  <p className="text-xs text-muted-foreground">15 invoices due for payment</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Pending Approval</p>
                  <p className="text-xs text-muted-foreground">12 invoices awaiting approval</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Processed Today</p>
                  <p className="text-xs text-muted-foreground">6 payments completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators for invoice management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">18</p>
              <p className="text-sm text-muted-foreground">Avg. Payment Days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">97%</p>
              <p className="text-sm text-muted-foreground">Payment Accuracy</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">$1,840</p>
              <p className="text-sm text-muted-foreground">Avg. Invoice Value</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}