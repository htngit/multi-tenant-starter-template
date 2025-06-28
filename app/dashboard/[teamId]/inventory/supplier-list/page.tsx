import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Users, 
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  FileText,
  Eye,
  Edit,
  MessageSquare,
  RefreshCw,
  Target,
  Activity,
  Zap,
  Settings,
  Timer,
  Wrench,
  Clipboard,
  PieChart,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Package,
  Truck,
  Calendar,
  User,
  Globe,
  Award,
  Clock,
  ShoppingCart,
  Handshake,
  FileCheck,
  AlertCircle,
  TrendingDown,
  ExternalLink,
  CreditCard,
  Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "Supplier List | XalesIn ERP",
  description: "Supplier management and vendor relationships",
};

/**
 * Supplier List Management Page Component
 * 
 * Features:
 * - Comprehensive supplier database
 * - Supplier performance tracking
 * - Contact and relationship management
 * - Purchase history and analytics
 * 
 * @returns JSX.Element - Supplier list management interface
 */
export default function SupplierListPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supplier List</h2>
          <p className="text-muted-foreground">
            Supplier management and vendor relationships
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Suppliers
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +8 new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground">
              77% of total suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
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
                placeholder="Search suppliers by name, category, location, or contact..."
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

      {/* Supplier List */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>
            Complete list of suppliers and vendor information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "SUP-2024-001",
                name: "TechComponents Global Ltd.",
                category: "Electronics",
                status: "Active",
                rating: 4.8,
                location: "Shenzhen, China",
                contact: "Li Wei",
                email: "li.wei@techcomponents.com",
                phone: "+86 755 1234 5678",
                totalOrders: 156,
                totalValue: "$485,200",
                lastOrder: "2024-01-15",
                paymentTerms: "Net 30",
                deliveryTime: "7-10 days",
                certifications: ["ISO 9001", "RoHS"],
                products: ["Semiconductors", "PCB Components", "Sensors"]
              },
              {
                id: "SUP-2024-002",
                name: "Premium Textiles Co.",
                category: "Textile",
                status: "Active",
                rating: 4.6,
                location: "Mumbai, India",
                contact: "Rajesh Sharma",
                email: "rajesh@premiumtextiles.in",
                phone: "+91 22 9876 5432",
                totalOrders: 89,
                totalValue: "$234,800",
                lastOrder: "2024-01-12",
                paymentTerms: "Net 45",
                deliveryTime: "14-21 days",
                certifications: ["GOTS", "OEKO-TEX"],
                products: ["Organic Cotton", "Denim", "Synthetic Fabrics"]
              },
              {
                id: "SUP-2024-003",
                name: "MetalWorks Industries",
                category: "Metal & Steel",
                status: "Active",
                rating: 4.4,
                location: "Pittsburgh, USA",
                contact: "John Anderson",
                email: "j.anderson@metalworks.com",
                phone: "+1 412 555 0123",
                totalOrders: 67,
                totalValue: "$567,300",
                lastOrder: "2024-01-16",
                paymentTerms: "Net 30",
                deliveryTime: "5-7 days",
                certifications: ["ISO 14001", "ASTM"],
                products: ["Stainless Steel", "Aluminum", "Custom Alloys"]
              },
              {
                id: "SUP-2024-004",
                name: "EcoPackaging Solutions",
                category: "Packaging",
                status: "Active",
                rating: 4.7,
                location: "Berlin, Germany",
                contact: "Anna Mueller",
                email: "anna.mueller@ecopack.de",
                phone: "+49 30 1234 5678",
                totalOrders: 134,
                totalValue: "$156,900",
                lastOrder: "2024-01-14",
                paymentTerms: "Net 30",
                deliveryTime: "10-14 days",
                certifications: ["FSC", "Cradle to Cradle"],
                products: ["Biodegradable Packaging", "Recycled Materials", "Custom Boxes"]
              },
              {
                id: "SUP-2024-005",
                name: "ChemSupply International",
                category: "Chemicals",
                status: "Under Review",
                rating: 4.1,
                location: "Singapore",
                contact: "David Tan",
                email: "david.tan@chemsupply.sg",
                phone: "+65 6789 0123",
                totalOrders: 23,
                totalValue: "$89,400",
                lastOrder: "2024-01-08",
                paymentTerms: "Net 60",
                deliveryTime: "21-28 days",
                certifications: ["ISO 45001", "REACH"],
                products: ["Industrial Chemicals", "Solvents", "Specialty Compounds"]
              }
            ].map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{supplier.name}</p>
                      <Badge 
                        variant={
                          supplier.status === "Active" ? "default" : 
                          supplier.status === "Under Review" ? "outline" : "destructive"
                        }
                      >
                        {supplier.status}
                      </Badge>
                      <Badge variant="outline">{supplier.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{supplier.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{supplier.id} • {supplier.contact}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{supplier.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{supplier.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{supplier.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {supplier.certifications.map((cert, certIndex) => (
                        <Badge key={certIndex} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  {/* Total Orders */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{supplier.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  
                  {/* Total Value */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{supplier.totalValue}</p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                  
                  {/* Delivery Time */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{supplier.deliveryTime}</p>
                    <p className="text-xs text-muted-foreground">Delivery</p>
                  </div>
                  
                  {/* Payment Terms */}
                  <div className="text-center">
                    <p className="text-sm font-medium">{supplier.paymentTerms}</p>
                    <p className="text-xs text-muted-foreground">Payment</p>
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
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Categories and Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Categories</CardTitle>
            <CardDescription>Distribution by supplier category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Electronics", count: 34, percentage: 27, value: "$1.2M", color: "bg-blue-600" },
                { category: "Textile", count: 28, percentage: 22, value: "$680K", color: "bg-green-600" },
                { category: "Metal & Steel", count: 22, percentage: 17, value: "$890K", color: "bg-gray-600" },
                { category: "Packaging", count: 18, percentage: 14, value: "$340K", color: "bg-purple-600" },
                { category: "Chemicals", count: 15, percentage: 12, value: "$450K", color: "bg-orange-600" },
                { category: "Others", count: 10, percentage: 8, value: "$180K", color: "bg-red-600" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{item.category}</span>
                      <p className="text-xs text-muted-foreground">{item.count} suppliers • {item.value}</p>
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
            <CardTitle>Top Performing Suppliers</CardTitle>
            <CardDescription>Highest rated and most reliable suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "TechComponents Global Ltd.",
                  category: "Electronics",
                  rating: 4.8,
                  orders: 156,
                  onTimeDelivery: 98,
                  qualityScore: 96
                },
                {
                  name: "EcoPackaging Solutions",
                  category: "Packaging",
                  rating: 4.7,
                  orders: 134,
                  onTimeDelivery: 95,
                  qualityScore: 94
                },
                {
                  name: "Premium Textiles Co.",
                  category: "Textile",
                  rating: 4.6,
                  orders: 89,
                  onTimeDelivery: 92,
                  qualityScore: 93
                },
                {
                  name: "MetalWorks Industries",
                  category: "Metal & Steel",
                  rating: 4.4,
                  orders: 67,
                  onTimeDelivery: 89,
                  qualityScore: 91
                }
              ].map((supplier, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.category} • {supplier.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{supplier.onTimeDelivery}% on-time</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Performance Metrics and Geographic Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key supplier performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">On-Time Delivery</span>
                </div>
                <span className="text-lg font-bold">93.2%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Quality Score</span>
                </div>
                <span className="text-lg font-bold">94.8%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Payment Compliance</span>
                </div>
                <span className="text-lg font-bold">97.5%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Handshake className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Relationship Score</span>
                </div>
                <span className="text-lg font-bold">4.3/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Supplier locations and regional breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  region: "Asia Pacific",
                  count: 45,
                  percentage: 35,
                  countries: ["China", "India", "Singapore", "Japan"]
                },
                {
                  region: "North America",
                  count: 32,
                  percentage: 25,
                  countries: ["USA", "Canada", "Mexico"]
                },
                {
                  region: "Europe",
                  count: 28,
                  percentage: 22,
                  countries: ["Germany", "UK", "France", "Italy"]
                },
                {
                  region: "South America",
                  count: 15,
                  percentage: 12,
                  countries: ["Brazil", "Argentina", "Chile"]
                },
                {
                  region: "Africa & Middle East",
                  count: 7,
                  percentage: 6,
                  countries: ["UAE", "South Africa", "Egypt"]
                }
              ].map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{region.region}</p>
                      <p className="text-xs text-muted-foreground">{region.count} suppliers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{region.percentage}%</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common supplier management operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add New Supplier
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Import Suppliers
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Performance Report
              </Button>
              <Button variant="outline" className="justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send RFQ
              </Button>
              <Button variant="outline" className="justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                Audit Suppliers
              </Button>
              <Button variant="outline" className="justify-start">
                <ExternalLink className="mr-2 h-4 w-4" />
                Supplier Portal
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Supplier Activity</CardTitle>
            <CardDescription>Latest supplier updates and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: "New Supplier Added",
                  supplier: "GreenTech Materials",
                  user: "Sarah Wilson",
                  time: "2 hours ago",
                  type: "add"
                },
                {
                  action: "Rating Updated",
                  supplier: "TechComponents Global",
                  user: "John Smith",
                  time: "4 hours ago",
                  type: "update"
                },
                {
                  action: "Contract Renewed",
                  supplier: "Premium Textiles Co.",
                  user: "Mike Johnson",
                  time: "6 hours ago",
                  type: "contract"
                },
                {
                  action: "Performance Review",
                  supplier: "MetalWorks Industries",
                  user: "Lisa Chen",
                  time: "8 hours ago",
                  type: "review"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === "add" ? "bg-green-100" :
                    activity.type === "update" ? "bg-blue-100" :
                    activity.type === "contract" ? "bg-purple-100" : "bg-orange-100"
                  }`}>
                    {activity.type === "add" ? (
                      <Plus className="h-4 w-4 text-green-600" />
                    ) : activity.type === "update" ? (
                      <Edit className="h-4 w-4 text-blue-600" />
                    ) : activity.type === "contract" ? (
                      <FileCheck className="h-4 w-4 text-purple-600" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.supplier}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Statistics Summary</CardTitle>
          <CardDescription>Overall supplier management statistics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">127</p>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">$2.4M</p>
              <p className="text-sm text-muted-foreground">Total Purchase Value</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.3</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}