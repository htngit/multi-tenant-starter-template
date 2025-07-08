import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  DollarSign,
  AlertTriangle,
  User,
  Calendar,
  Building2,
  Receipt,
  Banknote,
  TrendingUp,
  FileText
} from "lucide-react";

export const metadata: Metadata = {
  title: "Invoice Payment | XalesIn ERP",
  description: "Manage invoice payments and supplier transactions",
};

/**
 * Invoice Payment Management Page Component
 * 
 * Features:
 * - Process and track invoice payments
 * - Manage payment methods and schedules
 * - Monitor cash flow and payment analytics
 * - Integration with accounting and banking systems
 * 
 * @returns JSX.Element - Invoice payment management interface
 */
export default function InvoicePaymentPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoice Payment</h2>
          <p className="text-muted-foreground">
            Manage invoice payments and supplier transactions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$324,560</div>
            <p className="text-xs text-muted-foreground">
              +22% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$156,780</div>
            <p className="text-xs text-muted-foreground">
              42 invoices pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,450</div>
            <p className="text-xs text-muted-foreground">
              12 payments processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$23,450</div>
            <p className="text-xs text-muted-foreground">
              8 overdue payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest payment transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">PAY-{String(item).padStart(6, '0')}</p>
                    <p className="text-sm text-muted-foreground">INV-{String(item + 200).padStart(6, '0')}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">ABC Manufacturing</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sarah Wilson</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item} hours ago</span>
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
                    {item % 4 === 0 ? "Completed" : 
                     item % 3 === 0 ? "Processing" : 
                     item % 2 === 0 ? "Pending" : "Failed"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">${(3240 * item).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Bank Transfer</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Overview</CardTitle>
            <CardDescription>Current status of all payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Completed", count: 187, percentage: 74, color: "bg-green-600" },
                { status: "Processing", count: 28, percentage: 11, color: "bg-blue-600" },
                { status: "Pending", count: 32, percentage: 13, color: "bg-yellow-600" },
                { status: "Failed", count: 5, percentage: 2, color: "bg-red-600" }
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
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { method: "Bank Transfer", count: 156, amount: "$234,560", percentage: 72 },
                { method: "Credit Card", count: 45, amount: "$67,890", percentage: 21 },
                { method: "Check", count: 18, amount: "$18,450", percentage: 6 },
                { method: "Cash", count: 3, amount: "$3,660", percentage: 1 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.method}</p>
                      <p className="text-xs text-muted-foreground">{item.count} payments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.amount}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments and Cash Flow */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Payments due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { invoice: "INV-000234", supplier: "ABC Manufacturing", amount: "$12,450", due: "Tomorrow" },
                { invoice: "INV-000235", supplier: "XYZ Supplies", amount: "$8,760", due: "2 days" },
                { invoice: "INV-000236", supplier: "Global Parts", amount: "$15,230", due: "3 days" },
                { invoice: "INV-000237", supplier: "Tech Components", amount: "$6,890", due: "5 days" },
                { invoice: "INV-000238", supplier: "Industrial Materials", amount: "$9,340", due: "7 days" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.invoice}</p>
                      <p className="text-xs text-muted-foreground">{item.supplier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.amount}</p>
                    <p className="text-xs text-muted-foreground">Due {item.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Summary</CardTitle>
            <CardDescription>Payment flow analysis and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Total Outflow</span>
                </div>
                <span className="text-lg font-bold">$324,560</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Scheduled Payments</span>
                </div>
                <span className="text-lg font-bold">$52,670</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Avg. Payment Size</span>
                </div>
                <span className="text-lg font-bold">$1,736</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Payment Frequency</span>
                </div>
                <span className="text-lg font-bold">187/month</span>
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
            <CardDescription>Common payment operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Payment
              </Button>
              <Button variant="outline" className="justify-start">
                <Receipt className="mr-2 h-4 w-4" />
                Generate Receipt
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Payments
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Alerts</CardTitle>
            <CardDescription>Important notifications and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Overdue Payments</p>
                  <p className="text-xs text-muted-foreground">8 payments past due date</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Due This Week</p>
                  <p className="text-xs text-muted-foreground">15 payments due soon</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Processing</p>
                  <p className="text-xs text-muted-foreground">5 payments being processed</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Completed Today</p>
                  <p className="text-xs text-muted-foreground">12 payments successful</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators for payment processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">2.3</p>
              <p className="text-sm text-muted-foreground">Avg. Processing Days</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">$1,736</p>
              <p className="text-sm text-muted-foreground">Avg. Payment Amount</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History Trends</CardTitle>
          <CardDescription>Monthly payment volume and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { month: "December 2024", amount: "$324,560", payments: 187, growth: "+22%" },
              { month: "November 2024", amount: "$265,890", payments: 156, growth: "+15%" },
              { month: "October 2024", amount: "$231,450", payments: 142, growth: "+8%" },
              { month: "September 2024", amount: "$214,230", payments: 134, growth: "+12%" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.month}</p>
                    <p className="text-xs text-muted-foreground">{item.payments} payments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{item.amount}</p>
                  <p className="text-xs text-green-600">{item.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}